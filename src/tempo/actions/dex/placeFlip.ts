import * as AbiEvent from 'ox/AbiEvent'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'
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
 * Places a flip order that automatically flips when filled.
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
 * const hash = await Actions.dex.placeFlip(client, {
 *   amount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function placeFlip<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: placeFlip.Options,
): Promise<placeFlip.ReturnType> {
  return placeFlip.inner(write, client, options)
}

export namespace placeFlip {
  export type Args = {
    /** Amount of tokens to place in the order. */
    amount: bigint
    /** Target tick to flip to when the order is filled. */
    flipTick: number
    /** Price tick for the order. */
    tick: number
    /** Base token. */
    token: TokenId.TokenIdOrAddress
    /** Order type. */
    type: 'buy' | 'sell'
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
    options: placeFlip.Options,
  ): Promise<ActionReturnType<action>> {
    return (await action(client, {
      ...options,
      ...placeFlip.call(client, options as never),
    } as never)) as never
  }

  /**
   * Defines a call to the `placeFlip` function.
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
    const { amount, flipTick, tick, token, type } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [
        resolveToken(client, { token }).address,
        amount,
        type === 'buy',
        tick,
        flipTick,
      ],
      functionName: 'placeFlip',
    })
  }

  /**
   * Estimates the gas required for `placeFlip`.
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
    options: placeFlip.Options,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(options as never),
      ...placeFlip.call(client, options as never),
    } as never)
  }

  /**
   * Simulates `placeFlip`.
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
    options: placeFlip.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.stablecoinDex, 'placeFlip'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(options as never),
      ...placeFlip.call(client, options as never),
    } as never) as never
  }

  /**
   * Extracts the `OrderPlaced` event for a flip order from logs.
   *
   * @param logs - The logs.
   * @returns The `OrderPlaced` event for a flip order.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const logs_ = AbiEvent.extractLogs(Abis.stablecoinDex, logs, {
      eventName: 'OrderPlaced',
      strict: true,
    })
    const log = logs_.find((log) => log.args.isFlipOrder)
    if (!log) throw new Error('`OrderPlaced` event (flip order) not found.')
    return log
  }
}

type ActionReturnType<action> = action extends typeof writeSync
  ? writeSync.ReturnType
  : write.ReturnType
