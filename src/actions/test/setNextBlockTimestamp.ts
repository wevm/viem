import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type { Options as ModeOptions } from './internal/mode.js'
import { request } from './internal/schema.js'
import { type Quantity, toQuantity } from './internal/quantity.js'

/**
 * Sets the timestamp for the next block.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http('http://127.0.0.1:8545')
 * })
 *
 * await actions.setNextBlockTimestamp(client, {
 *   timestamp: 1_700_000_000n
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Nothing.
 */
export async function setNextBlockTimestamp<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: setNextBlockTimestamp.Options,
): setNextBlockTimestamp.ReturnType {
  await request(client, {
    method: 'evm_setNextBlockTimestamp',
    params: [toQuantity(options.timestamp)],
  })
}

export declare namespace setNextBlockTimestamp {
  type Options = ModeOptions & {
    /** Timestamp for the next block. */
    timestamp: Quantity
  }

  type ReturnType = Promise<void>

  type ErrorType = toQuantity.ErrorType
}
