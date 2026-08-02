import { AbiEvent } from 'ox'
import type { Address, Errors, Log } from 'ox'

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
  simulateWrite,
} from '../../internal/utils.js'

/**
 * Places a limit order on the orderbook.
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
 * const hash = await Actions.dex.place(client, {
 *   amount: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function place<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: place.Options,
): Promise<place.ReturnType> {
  return place.inner(write, client, options)
}

export namespace place {
  export type Args = {
    /** Amount of tokens to place in the order. */
    amount: bigint
    /** Price tick for the order. */
    tick: number
    /** Base token. */
    token: Address.Address
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
    options: place.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    // Keep call arguments (notably `type`, which collides with the
    // transaction type field) out of the write request.
    const { amount, tick, token, type, ...rest } = options
    return dispatchWrite(action, client, {
      ...rest,
      ...place.call(client, { amount, tick, token, type }),
    })
  }

  /**
   * Defines a call to the `place` function.
   *
   * Can be passed to any action that accepts a contract call. Tokens are
   * selected by TIP-20 token address.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { amount, tick, token, type } = args
    return defineCall({
      abi: Abis.stablecoinDex,
      address: Addresses.stablecoinDex,
      args: [token, amount, type === 'buy', tick],
      functionName: 'place',
    })
  }

  /**
   * Estimates the gas required for `place`.
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
    options: place.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...place.call(client, options),
    })
  }

  /**
   * Simulates `place`.
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
    options: place.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.stablecoinDex, 'place'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...place.call(client, options),
    })
  }

  /**
   * Extracts the `OrderPlaced` event from logs.
   *
   * @param logs - The logs.
   * @returns The `OrderPlaced` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.stablecoinDex, logs, {
      eventName: 'OrderPlaced',
      strict: true,
    })
    if (!log) throw new Error('`OrderPlaced` event not found.')
    return log
  }
}
