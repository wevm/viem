import type { Address } from 'abitype'
import * as RpcResponse from 'ox/RpcResponse'
import {
  AccountConfig,
  AccountOperation,
  KeyAuthorization,
  SignatureEnvelope,
} from 'ox/tempo'
import { getBlockNumber } from '../../../actions/public/getBlockNumber.js'
import type { Client } from '../../../clients/createClient.js'
import { BaseError } from '../../../errors/base.js'
import { isAddressEqual } from '../../../utils/address/isAddressEqual.js'
import * as Actions from '../../actions/index.js'
import type * as Relay from '../../Relay.js'
import * as Store from '../../Store.js'
import { selectApprovals, validateConfig } from './accounts.js'
import * as Plugin from './plugin.js'

/** Creates middleware that stores pending key authorizations and attaches them to fills. @internal */
export function create(
  options: Relay.keyAuthorization.Options = {},
): Relay.keyAuthorization.ReturnType {
  const { store = Store.memory() } = options
  if (!store.compareAndSet)
    throw new RpcResponse.InvalidParamsError({
      message:
        'Key authorization storage requires a store with atomic `compareAndSet`.',
    })
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
        const client = context.getClient(chainId)
        const account = await check(client, keyAuthorization)
        if (!account) return null
        // Drop an unusable pending authorization so it cannot block this one.
        await read(client, store, {
          account,
          accessKey: keyAuthorization.address,
          chainId,
        })
        if (!(await write(store, { account, keyAuthorization })))
          throw new RpcResponse.InvalidParamsError({
            message:
              'A pending key authorization for this access key expires later.',
          })
        return null
      }

      if (request.method === 'account_approveKeyAuthorization') {
        await next()
        const operation = AccountOperation.fromRpc(
          context.result as AccountOperation.Rpc,
        ) as AccountOperation.KeyAuthorizationOperation
        if (operation.status !== 'success') return
        const keyAuthorization = KeyAuthorization.deserialize(
          operation.keyAuthorization,
        ) as KeyAuthorization.Signed
        // Re-check completed operations: quorum may land after expiry, and a
        // stored success may predate a config rotation. The approval itself
        // succeeded, so an authorization that fails these checks, or loses to a
        // newer pending one, is skipped rather than reported.
        const chainId = Number(keyAuthorization.chainId)
        const client = context.getClient(chainId)
        const account = await check(client, keyAuthorization).catch(
          () => undefined,
        )
        if (!account) return
        await read(client, store, {
          account,
          accessKey: keyAuthorization.address,
          chainId,
        })
        await write(store, { account, keyAuthorization })
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

      const pending = await read(context.client, store, {
        account: account as Address,
        accessKey: accessKey as Address,
        chainId: context.options.chainId!,
      })
      if (!pending) return next()
      const metadata = await Actions.accessKey.getMetadata(context.client, {
        account: account as Address,
        accessKey: accessKey as Address,
      })
      // The key already landed onchain, so the authorization is spent.
      if (isActive(metadata, accessKey as Address)) {
        await remove(store, pending)
        return next()
      }
      const keyAuthorization = KeyAuthorization.toRpc(pending.keyAuthorization)

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

/**
 * Validates an authorization and returns the account it authorizes, or `undefined`
 * when the access key is already active onchain.
 */
async function check(
  client: Client,
  keyAuthorization: KeyAuthorization.Signed,
): Promise<Address | undefined> {
  if (isExpired(keyAuthorization))
    throw new RpcResponse.InvalidParamsError({
      message: 'Key authorization has expired.',
    })
  const account = await verify(client, keyAuthorization)
  if (await isBurned(client, { account, keyAuthorization }))
    throw new RpcResponse.InvalidParamsError({
      message: 'Key authorization witness has been burned.',
    })
  // Authorizations for keys that are already active would only be removed on the next fill.
  const metadata = await Actions.accessKey.getMetadata(client, {
    account,
    accessKey: keyAuthorization.address,
  })
  if (isActive(metadata, keyAuthorization.address)) return undefined
  return account
}

/** Verifies the authorization signature and returns the account it authorizes. */
async function verify(
  client: Client,
  keyAuthorization: KeyAuthorization.Signed,
): Promise<Address> {
  const { signature, ...unsigned } = keyAuthorization
  const payload = KeyAuthorization.getSignPayload(unsigned)

  if (signature.type === 'configurable') {
    if (
      !keyAuthorization.account ||
      !isAddressEqual(keyAuthorization.account, signature.account)
    )
      throw new RpcResponse.InvalidParamsError({
        message:
          'Configurable account key authorization account does not match its signature.',
      })
    const config = AccountConfig.from(signature.config)
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
      hash: AccountConfig.getSignPayload({
        account: signature.account,
        config,
        payload,
      }),
    })
    if (approvals.weight < approvals.threshold)
      throw new RpcResponse.InvalidParamsError({
        message:
          'Configurable account key authorization has not reached quorum.',
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

/**
 * Reads the pending authorization for an access key. Entries that are malformed,
 * expired, or whose witness has been burned are removed.
 */
async function read(
  client: Client,
  store: Store.Atomic,
  options: { account: Address; accessKey: Address; chainId: number },
) {
  const { account } = options
  const key = getKey(options)
  const value = await store.getItem(key)
  if (!value) return undefined
  const keyAuthorization = (() => {
    try {
      return KeyAuthorization.deserialize(
        value as `0x${string}`,
      ) as KeyAuthorization.Signed
    } catch {
      return undefined
    }
  })()
  if (
    keyAuthorization &&
    !isExpired(keyAuthorization) &&
    !(await isBurned(client, { account, keyAuthorization }))
  )
    return { key, keyAuthorization, value }
  await remove(store, { key, value })
  return undefined
}

/**
 * Removes a stored authorization only while it still holds the value that was read,
 * so a concurrently saved replacement survives. The empty value expires immediately.
 * @internal
 */
export async function remove(
  store: Store.Atomic,
  options: { key: string; value: string },
) {
  const { key, value } = options
  await store.compareAndSet(key, value, '', { expiresAt: Date.now() })
}

/** Returns whether the authorization's witness has been burned onchain. */
async function isBurned(
  client: Client,
  options: { account: Address; keyAuthorization: KeyAuthorization.Signed },
) {
  const { account, keyAuthorization } = options
  if (!keyAuthorization.witness) return false
  return Actions.accessKey.isWitnessBurned(client, {
    account,
    witness: keyAuthorization.witness,
  })
}

/**
 * Stores an authorization unless a pending authorization for the same key expires
 * later, so a replayed older authorization cannot replace a newer one.
 * @internal
 */
export async function write(
  store: Store.Atomic,
  options: {
    account: Address
    keyAuthorization: KeyAuthorization.Signed
  },
): Promise<boolean> {
  const { account, keyAuthorization } = options
  const key = getKey({
    account,
    accessKey: keyAuthorization.address,
    chainId: Number(keyAuthorization.chainId),
  })
  const value = KeyAuthorization.serialize(keyAuthorization)
  const expiresAt = Math.min(
    Date.now() + maxTtl,
    getExpiry(keyAuthorization) * 1_000,
  )
  for (let attempt = 0; attempt < maxWriteAttempts; attempt++) {
    const current = (await store.getItem(key)) ?? null
    const existing = (() => {
      if (!current) return undefined
      try {
        return KeyAuthorization.deserialize(current as `0x${string}`)
      } catch {
        return undefined
      }
    })()
    if (existing && current!.toLowerCase() === value.toLowerCase()) return true
    if (existing && getExpiry(existing) >= getExpiry(keyAuthorization))
      return false
    // A lost compare-and-set means another writer replaced the value, so compare again.
    if (await store.compareAndSet(key, current, value, { expiresAt }))
      return true
  }
  throw new StoreConflictError()
}

/** Maximum compare-and-set attempts before a write is abandoned. */
const maxWriteAttempts = 32

/** Maximum time a pending key authorization is kept. */
const maxTtl = 30 * 24 * 60 * 60 * 1_000

/** Returns the authorization expiry in seconds, treating no expiry as unbounded. */
function getExpiry(keyAuthorization: KeyAuthorization.KeyAuthorization) {
  const { expiry } = keyAuthorization
  return expiry === undefined || expiry === null
    ? Number.POSITIVE_INFINITY
    : Number(expiry)
}

/** Returns whether the access key is active onchain. */
function isActive(
  metadata: Actions.accessKey.getMetadata.ReturnValue,
  accessKey: Address,
) {
  return (
    isAddressEqual(metadata.address, accessKey) &&
    !metadata.isRevoked &&
    metadata.expiry > BigInt(Math.floor(Date.now() / 1000))
  )
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

/** Thrown when a pending key authorization cannot be written after repeated conflicts. */
class StoreConflictError extends BaseError {
  constructor() {
    super(
      'Pending key authorization could not be written after repeated conflicts.',
      { name: 'Relay.KeyAuthorization.StoreConflictError' },
    )
  }
}
