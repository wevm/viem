import type { Address, Errors } from 'ox'

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

/**
 * Gets the quote for buying a specific amount of tokens.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const amountIn = await Actions.dex.getBuyQuote(client, {
 *   amountOut: 100_000000n,
 *   tokenIn: '0x20c0000000000000000000000000000000000001',
 *   tokenOut: '0x20c0000000000000000000000000000000000002',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The amount of tokenIn needed to buy the specified amountOut.
 */
export async function getBuyQuote<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getBuyQuote.Options,
): Promise<getBuyQuote.ReturnType> {
  const { amountOut, tokenIn, tokenOut, ...rest } = options
  return read(client, {
    ...rest,
    ...getBuyQuote.call(client, { amountOut, tokenIn, tokenOut }),
  })
}

export namespace getBuyQuote {
  export type Args = {
    /** Amount of tokenOut to buy. */
    amountOut: bigint
    /** Token to spend. */
    tokenIn: Address.Address
    /** Token to buy. */
    tokenOut: Address.Address
  }
  export type Options = ReadParameters & Args
  /** The amount of tokenIn needed to buy the specified amountOut. */
  export type ReturnType = bigint
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the `quoteSwapExactAmountOut` function.
   *
   * Can be passed to any action that accepts a contract call.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        args.tokenIn,
        args.tokenOut,
        args.amountOut,
      ],
      functionName: 'quoteSwapExactAmountOut',
    })
  }
}
