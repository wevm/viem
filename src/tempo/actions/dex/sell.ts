import type * as Errors from 'ox/Errors'
import type * as TokenId from 'ox/tempo/TokenId'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
  simulateWrite,
} from '../../internal/utils.js'

/**
 * Sells a specific amount of tokens.
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
 * const hash = await Actions.dex.sell(client, {
 *   tokenIn: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function sell<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: sell.Options,
): Promise<sell.ReturnType> {
  return sell.inner(write, client, options)
}

export namespace sell {
  export type Args = {
    /** Token to sell. */
    tokenIn: TokenId.TokenIdOrAddress
    /** Token to receive. */
    tokenOut: TokenId.TokenIdOrAddress
    /** Amount of tokenIn to sell. */
    amountIn: bigint
    /** Minimum amount of tokenOut to receive. */
    minAmountOut: bigint
  }
  export type Options = WriteParameters & Args
  export type ReturnType = write.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: sell.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...sell.call(client, options),
    })
  }

  /**
   * Defines a call to the `swapExactAmountIn` function.
   *
   * Can be passed to any action that accepts a contract call. Tokens are
   * selected by TIP-20 token id or contract `address`.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { tokenIn, tokenOut, amountIn, minAmountOut } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        resolveToken(client, { token: tokenIn }).address,
        resolveToken(client, { token: tokenOut }).address,
        amountIn,
        minAmountOut,
      ],
      functionName: 'swapExactAmountIn',
    })
  }

  /**
   * Estimates the gas required for `sell`.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: sell.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...sell.call(client, options),
    })
  }

  /**
   * Simulates `sell`.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: sell.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.stablecoinDex, 'swapExactAmountIn'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...sell.call(client, options),
    })
  }
}
