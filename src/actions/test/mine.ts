import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { request } from './internal/request.js'
import { type Quantity, toQuantity } from './internal/quantity.js'

/**
 * Mines a number of blocks.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import * as actions from 'viem/actions'
 *
 * const client = Client.create({
 *   transport: http('http://127.0.0.1:8545'),
 * })
 *
 * await actions.mine(client, { blocks: 1n })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 */
export async function mine<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>, options: mine.Options): mine.ReturnType {
  const { blocks, interval = 0n } = options
  await request(client, {
    method: 'anvil_mine',
    params: [toQuantity(blocks), toQuantity(interval)],
  })
}

export declare namespace mine {
  type Options = {
    /** Number of blocks to mine. */
    blocks: Quantity
    /** Interval between each block, in seconds. */
    interval?: Quantity | undefined
  }

  type ReturnType = Promise<void>

  type ErrorType = toQuantity.ErrorType
}
