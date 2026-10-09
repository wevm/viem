import type { Address } from 'abitype'
import * as RpcResponse from 'ox/RpcResponse'
import {
  KeyAuthorization,
  MultisigConfig,
  MultisigOperation,
  SignatureEnvelope,
} from 'ox/tempo'
import { getBlockNumber } from '../../../actions/public/getBlockNumber.js'
import type { Client } from '../../../clients/createClient.js'
import { isAddressEqual } from '../../../utils/address/isAddressEqual.js'
import * as Actions from '../../actions/index.js'
import type * as Relay from '../../Relay.js'
import * as Store from '../../Store.js'
import { selectApprovals, validateConfig } from './multisig.js'
import * as Plugin from './plugin.js'

/** Creates middleware that stores pending key authorizations and attaches them to fills. @internal */
export function create(
  options: Relay.keyAuthorization.Options = {},
): Relay.keyAuthorization.ReturnType {
  const { store = Store.memory() } = options
  return Plugin.keyAuthorization({
    async handleRequest(context, next) {
      const { request } = context

      if (request.method === 'relay_setKeyAuthorization') {
        const keyAuthorization = parse(request.params?.[0])
        const chainId = Number(keyAuthorization.chainId)
        if (
          context.options.chainId !== undefined &&
          context.options.chainId !== chainId
        )
          throw new RpcResponse.InvalidParamsError({
            message: 'Conflicting chain ids.',
          })
        if (isExpired(keyAuthorization))
          throw new RpcResponse.InvalidParamsError({
            message: 'Key authorization has expired.',
          })
        const account = await verify(
          context.getClient(chainId),
          keyAuthorization,
        )
        await store.setItem(
          getKey({ account, accessKey: keyAuthorization.address, chainId }),
          KeyAuthorization.serialize(keyAuthorization),
        )
        return null
      }

      if (request.method === 'multisig_approveKeyAuthorization') {
        await next()
        // The multisig plugin validates the config and owner approvals before
        // reporting success, so the completed authorization can be stored as is.
        const operation = MultisigOperation.fromRpc(
          context.result as MultisigOperation.Rpc,
        ) as MultisigOperation.KeyAuthorizationOperation
        if (operation.status !== 'success') return
        const keyAuthorization = KeyAuthorization.deserialize(
          operation.keyAuthorization,
        )
        await store.setItem(
          getKey({
            account: operation.account,
            accessKey: keyAuthorization.address,
            chainId: Number(keyAuthorization.chainId),
          }),
          KeyAuthorization.serialize(keyAuthorization),
        )
        return
      }

      if (request.method !== 'eth_fillTransaction') return next()

      const parameters = request.params?.[0] as Record<string, unknown>
      const { from: account, keyId: accessKey } = parameters
      if (
        parameters.keyAuthorization ||
        typeof account !== 'string' ||
        typeof accessKey !== 'string'
      )
        return next()

      const chainId = context.options.chainId!
      const key = getKey({
        account: account as Address,
        accessKey: accessKey as Address,
        chainId,
      })
      const keyAuthorization = await (async () => {
        const value = await store.getItem(key)
        if (!value) return undefined
        const keyAuthorization = (() => {
          try {
            return KeyAuthorization.deserialize(value as `0x${string}`)
          } catch {
            return undefined
          }
        })()
        if (!keyAuthorization || isExpired(keyAuthorization)) {
          await store.removeItem(key)
          return undefined
        }
        const metadata = await Actions.accessKey.getMetadata(context.client, {
          account: account as Address,
          accessKey: accessKey as Address,
        })
        // The key already landed onchain, so the authorization is spent.
        if (
          isAddressEqual(metadata.address, accessKey as Address) &&
          !metadata.isRevoked &&
          metadata.expiry > BigInt(Math.floor(Date.now() / 1000))
        ) {
          await store.removeItem(key)
          return undefined
        }
        return KeyAuthorization.toRpc(
          keyAuthorization as KeyAuthorization.Signed,
        )
      })()
      if (!keyAuthorization) return next()

      // Attach before forwarding so gas estimation and later plugins see the authorization.
      context.request = {
        ...request,
        params: [{ ...parameters, keyAuthorization }],
      }
      return next()
    },
  })
}

/** Parses a signed key authorization from RPC parameters. */
function parse(value: unknown) {
  const keyAuthorization = (() => {
    try {
      if (typeof value === 'string')
        return KeyAuthorization.deserialize(value as `0x${string}`)
      return KeyAuthorization.fromRpc(value as KeyAuthorization.Rpc)
    } catch {
      return undefined
    }
  })()
  if (!keyAuthorization?.signature)
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected a signed key authorization.',
    })
  return keyAuthorization as KeyAuthorization.Signed
}

/** Verifies the authorization signature and returns the account it authorizes. */
async function verify(
  client: Client,
  keyAuthorization: KeyAuthorization.Signed,
): Promise<Address> {
  const { signature, ...unsigned } = keyAuthorization
  const payload = KeyAuthorization.getSignPayload(unsigned)

  if (signature.type === 'multisig') {
    if (
      !keyAuthorization.account ||
      !isAddressEqual(keyAuthorization.account, signature.account)
    )
      throw new RpcResponse.InvalidParamsError({
        message:
          'Multisig key authorization account does not match its signature.',
      })
    const config = MultisigConfig.from(signature.config)
    await validateConfig({
      account: signature.account,
      blockNumber: await getBlockNumber(client, { cacheTime: 0 }),
      client: client as never,
      config,
    })
    const approvals = await selectApprovals({
      account: signature.account,
      approvals: signature.signatures.map((signature) =>
        SignatureEnvelope.serialize(signature),
      ),
      config,
      hash: MultisigConfig.getSignPayload({
        account: signature.account,
        config,
        payload,
      }),
    })
    if (approvals.weight < approvals.threshold)
      throw new RpcResponse.InvalidParamsError({
        message: 'Multisig key authorization has not reached quorum.',
      })
    return signature.account
  }

  const signer = (() => {
    try {
      const signer = SignatureEnvelope.extractAddress({ payload, signature })
      if (SignatureEnvelope.verify(signature, { address: signer, payload }))
        return signer
    } catch {}
    throw new RpcResponse.InvalidParamsError({
      message: 'Invalid key authorization signature.',
    })
  })()

  // Admin-signed authorizations can only be submitted by the admin key itself,
  // so only authorizations signed by the account can be attached for the new key.
  if (
    keyAuthorization.account &&
    !isAddressEqual(keyAuthorization.account, signer)
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Key authorization must be signed by its account.',
    })
  return signer
}

function isExpired(keyAuthorization: KeyAuthorization.KeyAuthorization) {
  const { expiry } = keyAuthorization
  return (
    expiry !== undefined &&
    expiry !== null &&
    BigInt(expiry) <= BigInt(Math.floor(Date.now() / 1000))
  )
}

function getKey(options: {
  account: Address
  accessKey: Address
  chainId: number
}) {
  const { account, accessKey, chainId } = options
  return [
    'keyAuthorization',
    chainId,
    account.toLowerCase(),
    accessKey.toLowerCase(),
  ].join(':')
}
