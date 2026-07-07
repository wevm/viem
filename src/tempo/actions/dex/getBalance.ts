import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as TokenId from 'ox/tempo/TokenId'

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
  resolveToken,
} from '../../internal/utils.js'

/**
 * Gets a user's token balance on the DEX.
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
 * const balance = await Actions.dex.getBalance(client, {
 *   token: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The user's token balance on the DEX.
 */
export async function getBalance<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getBalance.Options,
): Promise<getBalance.ReturnType> {
  const { account: account_ = client.account, token, ...rest } = options
  if (!account_) throw new Account.NotFoundError()
  const address = typeof account_ === 'string' ? account_ : account_.address
  return read(client, {
    ...rest,
    ...getBalance.call(client, { account: address, token }),
  })
}

export namespace getBalance {
  export type Args = {
    /** Account (or address) that owns the DEX balance. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /** Token to query. */
    token: TokenId.TokenIdOrAddress
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  /** The user's token balance on the DEX. */
  export type ReturnType = bigint
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `balanceOf` function.
   *
   * Can be passed to any action that accepts a contract call.
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
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [address, resolveToken(client, { token: args.token }).address],
      functionName: 'balanceOf',
    })
  }
}
