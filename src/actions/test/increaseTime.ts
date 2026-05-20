import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type { Options as ModeOptions } from './internal/mode.js'
import { request } from './internal/schema.js'
import { type Quantity, toQuantity } from './internal/quantity.js'

/**
 * Increases the next block timestamp by a number of seconds.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('http://127.0.0.1:8545'),
 * })
 *
 * await actions.increaseTime(client, { seconds: 60n })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Total time offset, in seconds.
 */
export async function increaseTime<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: increaseTime.Options,
): increaseTime.ReturnType {
  const result = await request(client, {
    method: 'evm_increaseTime',
    params: [toQuantity(options.seconds)],
  })
  return Hex.toBigInt(result)
}

export declare namespace increaseTime {
  type Options = ModeOptions & {
    /** Seconds to increase the next block timestamp by. */
    seconds: Quantity
  }

  type ReturnType = Promise<bigint>

  type ErrorType = toQuantity.ErrorType | Hex.toBigInt.ErrorType
}
