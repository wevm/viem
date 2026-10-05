import { Address, type Hex } from 'ox'
import { KeyAuthorization, MultisigConfig } from 'ox/tempo'
import * as CoreAccount from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { Compute } from '../../../core/internal/types.js'
import {
  getKeyAuthorizationSignPayload,
  resolveAccessKey,
  signKeyAuthorization,
  type MultisigAccount,
} from '../../Account.js'

/**
 * Prepares a key authorization for signing.
 *
 * @example
 * ```ts
 * const authorization = await Actions.accessKey.prepareAuthorization(client, {
 *   account,
 *   accessKey,
 * })
 * const keyAuthorization = await Actions.accessKey.signAuthorization(
 *   client,
 *   authorization,
 * )
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Prepared key authorization parameters.
 */
export async function prepareAuthorization<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: prepareAuthorization.Options<account>,
): Promise<prepareAuthorization.ReturnType> {
  const { chainId = client.chain?.id } = parameters
  const account_ = parameters.account ?? client.account
  if (!account_) throw new Error('account is required.')
  if (!chainId) throw new Error('chainId is required.')
  const parsed = CoreAccount.from(account_)
  const multisigState = await (async () => {
    if ('multisig' in parameters) return parameters.multisig
    if (!('source' in parsed) || parsed.source !== 'multisig') return undefined
    const account = parsed as MultisigAccount
    if (!account.config)
      throw new Error(
        'A multisig config is required to prepare a key authorization.',
      )
    return { config: account.config }
  })()
  const authorizationSignPayload = getKeyAuthorizationSignPayload(
    parsed as CoreAccount.Local,
    {
      ...parameters,
      chainId: BigInt(chainId),
      key: parameters.accessKey,
    },
  )
  const signPayload =
    'source' in parsed && parsed.source === 'multisig' && multisigState
      ? MultisigConfig.getSignPayload({
          account: parsed.address,
          config: multisigState.config,
          payload: authorizationSignPayload,
        })
      : authorizationSignPayload
  return {
    ...parameters,
    account: parsed,
    chainId,
    multisig: multisigState,
    signPayload,
  } as prepareAuthorization.ReturnType
}

export namespace prepareAuthorization {
  export type Options<
    account extends CoreAccount.Account | undefined =
      | CoreAccount.Account
      | undefined,
  > = {
    account?: account | CoreAccount.Account | Address.Address | undefined
  } & {
    /** The access key to authorize. */
    accessKey: resolveAccessKey.Parameters
    /**
     * Whether to authorize the key as an admin key. Admin keys are unrestricted
     * and can manage the account's other access keys; `expiry`, `limits`, and
     * `scopes` are ignored. Requires the T6 hardfork.
     *
     * [TIP-1049](https://tips.sh/1049)
     */
    admin?: boolean | undefined
    /** The chain ID. */
    chainId?: number | undefined
    /** Unix timestamp when the key expires. */
    expiry?: number | undefined
    /** Spending limits per token. */
    limits?:
      | { token: Address.Address; limit: bigint; period?: number | undefined }[]
      | undefined
    /** @internal Prepared multisig state. */
    multisig?: signKeyAuthorization.Parameters['multisig']
    /** Call scopes restricting which contracts/selectors this key can call. */
    scopes?: KeyAuthorization.Scope[] | undefined
    /**
     * Optional 32-byte witness bound into the authorization's signing hash.
     *
     * Applications use this to bind a single signature to an arbitrary offchain
     * context (e.g. a server-issued challenge), or as a revocation handle that
     * can be burned onchain (see {@link burnWitness}) to invalidate the
     * authorization before it is submitted.
     *
     * [TIP-1053](https://tips.sh/1053)
     */
    witness?: Hex.Hex | undefined
  }

  export type ReturnType = Compute<
    Omit<Options<CoreAccount.Account | undefined>, 'account' | 'chainId'> & {
      account: CoreAccount.Account
      chainId: number
      multisig: signKeyAuthorization.Parameters['multisig']
      /** Payload that the authorizing account or multisig owners sign. */
      signPayload: Hex.Hex
    }
  >
}
