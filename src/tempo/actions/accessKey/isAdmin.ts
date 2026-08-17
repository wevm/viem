import type { Address, Errors } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import type { AccessKeyAccount } from '../../Account.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
} from '../../internal/utils.js'
import { resolveAccessKeyAddress } from './internal.js'

/**
 * Checks whether an access key is an admin key for an account.
 *
 * Returns `true` for the account's root key or for an active admin access key
 * (see {@link authorize} with `admin: true`).
 *
 * [TIP-1049](https://tips.sh/1049)
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const isAdmin = await Actions.accessKey.isAdmin(client, {
 *   account: '0x…',
 *   accessKey: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Whether the access key is an admin key.
 */
export async function isAdmin<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: isAdmin.Options,
): Promise<isAdmin.ReturnType> {
  const { accessKey, account, ...rest } = options
  return read(client, {
    ...rest,
    ...isAdmin.call(client, { accessKey, account }),
  })
}

export namespace isAdmin {
  export type Args = {
    /** Access key to check. */
    accessKey: Address.Address | AccessKeyAccount
    /** Account (or address) that owns the key. @default client.account */
    account?: Account.Account | Address.Address | undefined
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = boolean
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `isAdminKey` function.
   *
   * Can be passed to any action that accepts a contract call. `account`
   * defaults to the client's account when a client is provided.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(...parameters: CallParameters<Args, Client.Client<chain, account>>) {
    const [client, args] = resolveCallParameters(parameters)
    const account_ = args.account ?? client?.account
    if (!account_) throw new Account.NotFoundError()
    const address = typeof account_ === 'string' ? account_ : account_.address
    return defineCall({
      abi: Abis.accountKeychain,
      address: Addresses.accountKeychain,
      args: [address, resolveAccessKeyAddress(args.accessKey)],
      functionName: 'isAdminKey',
    })
  }
}
