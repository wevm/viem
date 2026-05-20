import type * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { request } from './internal/schema.js'

/**
 * Snapshots the current chain state.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('http://127.0.0.1:8545'),
 * })
 *
 * const id = await actions.snapshot(client)
 * ```
 *
 * @param client - Client to use.
 * @returns Snapshot ID.
 */
export async function snapshot<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>): snapshot.ReturnType {
  return request(client, {
    method: 'evm_snapshot',
  })
}

export declare namespace snapshot {
  type ReturnType = Promise<Hex.Hex>

  type ErrorType = never
}
