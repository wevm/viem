import type { Errors, Hex } from 'ox'

import * as CoreAccount from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Account from '../../Account.js'

/**
 * Signs a key authorization for an access key.
 *
 * The signed authorization can be attached to a transaction via the
 * `keyAuthorization` field to authorize the key onchain (see {@link authorize}
 * for a one-step variant).
 *
 * @example
 * ```ts
 * import { P256 } from 'ox'
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x…')
 * const client = Client.create({
 *   account,
 *   transport: http(),
 * })
 *
 * const accessKey = Account.fromP256(P256.randomPrivateKey(), {
 *   access: account,
 * })
 *
 * const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
 *   accessKey,
 *   expiry: Math.floor((Date.now() + 30_000) / 1000),
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The signed key authorization.
 */
export async function signAuthorization<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: signAuthorization.Options,
): Promise<signAuthorization.ReturnType> {
  const {
    accessKey,
    account: account_ = client.account,
    chainId = client.chain?.id,
    ...rest
  } = options
  if (!account_) throw new CoreAccount.NotFoundError()
  if (typeof account_ === 'string')
    throw new Error('account signing is required.')
  if (chainId === undefined) throw new Error('chainId is required.')
  return Account.signKeyAuthorization(account_ as CoreAccount.Local, {
    ...rest,
    chainId,
    key: accessKey,
  })
}

export namespace signAuthorization {
  export type Args = Pick<
    Account.signKeyAuthorization.Parameters,
    'admin' | 'expiry' | 'limits' | 'scopes' | 'witness'
  > & {
    /** Access key to authorize. */
    accessKey: Account.resolveAccessKey.Parameters
    /** Account to sign with. @default client.account */
    account?: CoreAccount.Account | Hex.Hex | undefined
    /** Chain ID for replay protection. @default client.chain.id */
    chainId?: number | bigint | undefined
  }
  export type Options = Args
  export type ReturnType = Account.signKeyAuthorization.ReturnValue
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
