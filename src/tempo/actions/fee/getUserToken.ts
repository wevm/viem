import type { Address, Errors } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
} from '../../internal/utils.js'

const zeroAddress = '0x0000000000000000000000000000000000000000'

/**
 * Gets an account's default fee token.
 *
 * Returns `null` when the account has no fee token preference set.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const token = await Actions.fee.getUserToken(client)
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The account's fee token address, or `null` if unset.
 */
export async function getUserToken<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getUserToken.Options = {},
): Promise<getUserToken.ReturnType> {
  const { account, ...rest } = options
  const address = await read(client, {
    ...rest,
    ...getUserToken.call(client, { account }),
  })
  if (address === zeroAddress) return null
  return address
}

export namespace getUserToken {
  export type Args = {
    /** Account (or address) to read the fee token of. @default client.account */
    account?: Account.Account | Address.Address | undefined
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = Address.Address | null
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `userTokens` function.
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
      abi: Abis.feeManager,
      address: Addresses.feeManager,
      args: [address],
      functionName: 'userTokens',
    })
  }
}
