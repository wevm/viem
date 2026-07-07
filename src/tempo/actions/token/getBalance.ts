import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { type Amount, toAmount } from '../../../core/actions/token/internal.js'
import * as Abis from '../../Abis.js'
import type { ReadParameters, TokenParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
  resolveToken,
  resolveTokenWithDecimals,
} from '../../internal/utils.js'

/**
 * Gets the TIP-20 token balance of an account.
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
 * const balance = await Actions.token.getBalance(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token balance, in base units and human-readable form.
 */
export async function getBalance<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getBalance.Options,
): Promise<getBalance.ReturnType> {
  const {
    account: account_ = client.account,
    decimals,
    token,
    ...rest
  } = options
  if (!account_) throw new Account.NotFoundError()
  const address = typeof account_ === 'string' ? account_ : account_.address
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getBalance.call(client, { account: address, token }),
    }),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getBalance {
  export type Args = {
    /** Account (or address) that owns the tokens. @default client.account */
    account?: Account.Account | Address.Address | undefined
  } & TokenParameters
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = Amount
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `balanceOf` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is either a TIP-20 token id or a contract
   * `address`; `decimals` is inferred from the client's declared `tokens` when
   * omitted.
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
      abi: Abis.tip20,
      address: resolveToken(client, args).address,
      args: [address],
      functionName: 'balanceOf',
    })
  }
}
