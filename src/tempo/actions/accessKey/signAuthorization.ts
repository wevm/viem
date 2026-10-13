import { parseApproval } from '../../accounts/Signature.js'
import { Address, type Errors, type Hex, RpcResponse } from 'ox'
import { AccountOperation, KeyAuthorization, SignatureEnvelope } from 'ox/tempo'
import * as CoreAccount from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { Compute, OneOf } from '../../../core/internal/types.js'
import {
  fromConfig,
  resolveAccessKey,
  signKeyAuthorization,
  type ConfigurableAccount,
  type RootAccount,
} from '../../Account.js'
import { getConfig } from '../accounts/getConfig.js'
import { prepareAuthorization } from './prepareAuthorization.js'
import { saveAuthorization } from './saveAuthorization.js'

/**
 * Signs a key authorization for an access key.
 *
 * Use {@link prepareAuthorization} before this action when signing requires
 * transient user activation.
 *
 * When the client transport is a relay with the `Relay.keyAuthorization` plugin,
 * an authorization signed by the account is saved to the relay, which attaches it
 * to the access key's next transaction.
 *
 * @param client - Client.
 * @param parameters - Authorization fields, or a stored operation hash.
 * @returns A signed key authorization with account operation metadata when coordinated.
 */
export function signAuthorization<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: signAuthorization.CoordinatedOptions,
): Promise<signAuthorization.CoordinatedReturnType>
export function signAuthorization<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: signAuthorization.LocalOptions<account>,
): Promise<signAuthorization.ReturnType>
export async function signAuthorization<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: signAuthorization.Options<account>,
): Promise<
  signAuthorization.CoordinatedReturnType | signAuthorization.ReturnType
> {
  const coordinated =
    ('hash' in parameters && parameters.hash) ||
    ('owner' in parameters && parameters.owner)

  if (coordinated) {
    const parameters_ = parameters as signAuthorization.CoordinatedOptions
    const owner_ = parameters_.owner
    if (!owner_ || typeof owner_ === 'string')
      throw new Error(
        'A local owner account is required to approve a configurable account key authorization.',
      )
    const owner = owner_
    const sign = owner.sign
    if (!sign)
      throw new Error(
        'A local owner account is required to approve a configurable account key authorization.',
      )

    const request = await (async () => {
      if ('hash' in parameters_ && parameters_.hash) {
        const signature = SignatureEnvelope.serialize(
          SignatureEnvelope.from(await sign({ hash: parameters_.hash })),
        )
        return { hash: parameters_.hash, signature }
      }

      const {
        account: account_,
        owner: _,
        ...authorization
      } = parameters_ as signAuthorization.CoordinatedInitialOptions
      const address = typeof account_ === 'string' ? account_ : account_.address
      const config = await (async () => {
        if (typeof account_ !== 'string' && account_.config)
          return account_.config
        const config = await getConfig(client, { address })
        if (config) return config
        throw new Error(
          `No current account config is cached for account ${address}. Provide the current config.`,
        )
      })()
      const account = (() => {
        if (config.version !== 0n) return fromConfig({ address, ...config })
        const { version: _, ...initialConfig } = config
        return fromConfig({ address: 'infer', ...initialConfig })
      })()
      if (!Address.isEqual(account.address, address))
        throw new Error('Initial account config does not match the account.')
      const prepared = await prepareAuthorization(client, {
        ...authorization,
        account,
      })
      const signature = SignatureEnvelope.serialize(
        SignatureEnvelope.from(await sign({ hash: prepared.signPayload })),
      )
      const { accessKey, admin, chainId, expiry, limits, scopes, witness } =
        prepared
      const { accessKeyAddress, keyType: type } = resolveAccessKey(accessKey)
      const keyAuthorization = KeyAuthorization.from({
        account: account.address,
        address: accessKeyAddress,
        chainId: BigInt(chainId),
        signature: SignatureEnvelope.from({
          account: account.address,
          config,
          signatures: [parseApproval(signature)],
        }),
        type,
        ...(witness ? { witness } : {}),
        ...(admin ? { isAdmin: true } : { expiry, limits, scopes }),
      } as KeyAuthorization.Signed)
      return { keyAuthorization: KeyAuthorization.toRpc(keyAuthorization) }
    })()

    const operation = await client.request({
      method: 'account_approveKeyAuthorization',
      params: [request],
    })
    const operation_ = AccountOperation.fromRpc(
      operation as AccountOperation.KeyAuthorizationRpc,
    )
    const keyAuthorization = KeyAuthorization.deserialize(
      await (async () => {
        if (operation_.status === 'success') return operation_.keyAuthorization
        const approvals = await AccountOperation.selectApprovals({
          account: operation_.account,
          approvals: operation_.approvals,
          config: operation_.config,
          hash: operation_.hash,
        })
        return AccountOperation.serializeKeyAuthorization(
          operation_.keyAuthorization,
          {
            account: operation_.account,
            approvals:
              approvals.selectedApprovals.length > 0
                ? approvals.selectedApprovals
                : approvals.approvals.slice(0, 1),
            config: operation_.config,
          },
        )
      })(),
    )
    if (!keyAuthorization.signature)
      throw new Error(
        'Expected a signed configurable account key authorization.',
      )
    return {
      ...keyAuthorization,
      hash: operation_.hash,
      operation: operation_,
      status: operation_.status,
    } as signAuthorization.CoordinatedReturnType
  }

  const prepared = (
    'signPayload' in parameters
      ? parameters
      : await prepareAuthorization(
          client,
          parameters as signAuthorization.LocalOptions<account>,
        )
  ) as prepareAuthorization.ReturnType
  const {
    accessKey,
    account: account_,
    chainId,
    configurable: configurableState,
    signPayload: _,
    ...rest
  } = prepared
  const keyAuthorization = await signKeyAuthorization(
    account_ as CoreAccount.Local,
    {
      chainId: BigInt(chainId),
      key: accessKey,
      configurable: configurableState,
      ...rest,
    },
  )
  // Admin-signed authorizations can only be submitted by the admin key.
  if (
    'keyAuthorization' in client.transport &&
    client.transport.keyAuthorization &&
    !('source' in account_ && account_.source === 'accessKey')
  )
    await saveAuthorization(client, { keyAuthorization }).catch((error) => {
      // Remote relays without key authorization storage do not expose this method.
      if (
        error instanceof RpcResponse.MethodNotFoundError ||
        error instanceof RpcResponse.MethodNotSupportedError
      )
        return
      throw error
    })
  return keyAuthorization
}

export namespace signAuthorization {
  /** Initial coordinated key authorization parameters. */
  export type CoordinatedInitialOptions = Omit<
    prepareAuthorization.Options<CoreAccount.Account>,
    'account' | 'configurable'
  > & {
    /** Configurable account being authorized. */
    account: Address.Address | ConfigurableAccount
    /** Local owner that approves the authorization. */
    owner: RootAccount
  }

  /** Coordinated key authorization parameters. */
  export type CoordinatedOptions = OneOf<
    | CoordinatedInitialOptions
    | {
        /** Stored account operation hash. */
        hash: Hex.Hex
        /** Local owner that approves the authorization. */
        owner: RootAccount
      }
  >

  /** Locally signed key authorization parameters. */
  export type LocalOptions<
    account extends CoreAccount.Account | undefined =
      | CoreAccount.Account
      | undefined,
  > = prepareAuthorization.Options<account> & {
    /** Serialized approvals from external owners. */
    signatures?: readonly SignatureEnvelope.Serialized[] | undefined
  }

  /** Parameters for {@link signAuthorization}. */
  export type Options<
    account extends CoreAccount.Account | undefined =
      | CoreAccount.Account
      | undefined,
  > = CoordinatedOptions | LocalOptions<account>

  /** Local return value for {@link signAuthorization}. */
  export type ReturnType = KeyAuthorization.Signed

  /** Coordinated return value for {@link signAuthorization}. */
  export type CoordinatedReturnType = Compute<
    ReturnType & {
      /** Deterministic account operation hash. */
      hash: Hex.Hex
      /** Current account operation. */
      operation: AccountOperation.KeyAuthorizationOperation
      /** Current account operation status. */
      status: AccountOperation.KeyAuthorizationOperation['status']
    }
  >

  /** Error type for {@link signAuthorization}. */
  export type ErrorType = Errors.GlobalErrorType
}
