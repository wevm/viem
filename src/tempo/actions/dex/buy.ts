import type * as Errors from 'ox/Errors'
import type * as TokenId from 'ox/tempo/TokenId'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas as estimateContractGas } from '../../../core/actions/contract/estimateGas.js'
import { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
} from '../../internal/utils.js'

/**
 * Buys a specific amount of tokens.
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
 * const hash = await Actions.dex.buy(client, {
 *   tokenIn: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function buy<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: buy.Options,
): Promise<buy.ReturnType> {
  return buy.inner(write, client, options)
}

export namespace buy {
  export type Args = {
    /** Token to spend. */
    tokenIn: TokenId.TokenIdOrAddress
    /** Token to buy. */
    tokenOut: TokenId.TokenIdOrAddress
    /** Amount of tokenOut to buy. */
    amountOut: bigint
    /** Maximum amount of tokenIn to spend. */
    maxAmountIn: bigint
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
    options: buy.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...buy.call(client, options as never),
    } as never)) as never
  }

  /**
   * Defines a call to the `swapExactAmountOut` function.
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
    const { tokenIn, tokenOut, amountOut, maxAmountIn } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        resolveToken(client, { token: tokenIn }).address,
        resolveToken(client, { token: tokenOut }).address,
        amountOut,
        maxAmountIn,
      ],
      functionName: 'swapExactAmountOut',
    })
  }

  /**
   * Estimates the gas required for `buy`.
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
    options: buy.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...buy.call(client, options as never),
    } as never)
  }

  /**
   * Simulates `buy`.
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
    options: buy.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.stablecoinDex, 'swapExactAmountOut'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...buy.call(client, options as never),
    } as never) as never
  }
}

type ActionReturnType<action> = action extends typeof writeSync
  ? writeSync.ReturnType
  : write.ReturnType
