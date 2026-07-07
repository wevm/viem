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
 * Gets the total supply of a TIP-20 token.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const totalSupply = await Actions.token.getTotalSupply(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token total supply, in base units and human-readable form.
 */
export async function getTotalSupply<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getTotalSupply.Options,
): Promise<getTotalSupply.ReturnType> {
  const { decimals, token, ...rest } = options
  const [amount, { decimals: resolved }] = await Promise.all([
    read(client, {
      ...rest,
      ...getTotalSupply.call(client, { token }),
    }),
    resolveTokenWithDecimals(client, { decimals, token }),
  ])
  return toAmount(amount as bigint, resolved)
}

export namespace getTotalSupply {
  export type Args = TokenParameters
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = Amount
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `totalSupply` function.
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
      args: [],
      functionName: 'totalSupply',
    })
  }
}
