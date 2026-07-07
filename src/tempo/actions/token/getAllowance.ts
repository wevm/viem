import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Account from '../../../core/Account.js'
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
 * Gets the TIP-20 allowance a spender has over an account's tokens.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const allowance = await Actions.token.getAllowance(client, {
 *   account: '0x…',
 *   spender: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The allowance, in base units and human-readable form.
 */
export async function getAllowance<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getAllowance.Options,
): Promise<getAllowance.ReturnType> {
  const { account, decimals, spender, token, ...rest } = options
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getAllowance.call(client, { account, spender, token }),
    }),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getAllowance {
  export type Args = {
    /** Account that owns the tokens. */
    account: Address.Address
    /** Spender of the tokens. */
    spender: Address.Address
  } & TokenParameters
  export type Options = ReadParameters & Args
  export type ReturnType = Amount
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `allowance` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is either a TIP-20 token id or a contract
   * `address`; `decimals` is inferred from the client's declared `tokens` when
   * omitted.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, args).address,
      args: [args.account, args.spender],
      functionName: 'allowance',
    })
  }
}
