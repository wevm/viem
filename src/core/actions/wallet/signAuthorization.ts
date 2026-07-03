import type * as Authorization from 'ox/Authorization'
import type * as Errors from 'ox/Errors'

import * as Account from '../../Account.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { prepareAuthorization } from './prepareAuthorization.js'

/**
 * Signs an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702)
 * object. Fills the required fields of the Authorization object if they are not
 * provided (e.g. `nonce` and `chainId`).
 *
 * Only Local Accounts can sign Authorizations; JSON-RPC Accounts are rejected.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const authorization = await Actions.wallet.signAuthorization(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 * ```
 */
export async function signAuthorization(
  client: Client.Client,
  options: signAuthorization.Options,
): Promise<signAuthorization.ReturnType> {
  const { account: account_ = client.account } = options

  if (!account_) throw new Account.NotFoundError()
  const account =
    typeof account_ === 'string' ? Account.from(account_) : account_

  if (account.type !== 'local' || !account.signAuthorization)
    throw new AccountTypeNotSupportedError({ type: account.type })

  const authorization = await prepareAuthorization(client, options)
  return account.signAuthorization(authorization)
}

export declare namespace signAuthorization {
  type Options = prepareAuthorization.Options

  type ReturnType = Authorization.Authorization<true>

  type ErrorType =
    | Account.NotFoundError
    | AccountTypeNotSupportedError
    | prepareAuthorization.ErrorType
    | Errors.GlobalErrorType
}

/** Thrown when an Account type does not support signing Authorizations. */
export class AccountTypeNotSupportedError extends BaseError {
  override readonly name =
    'Actions.wallet.signAuthorization.AccountTypeNotSupportedError'

  constructor({ type }: { type: string }) {
    super(`Account type "${type}" is not supported.`, {
      metaMessages: [
        'The `signAuthorization` Action does not support JSON-RPC Accounts.',
      ],
    })
  }
}
