import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Hex from '../../utils/Hex.js'

/**
 * Creates a filter to listen for new block hashes that can be used with
 * {@link actions.getFilterChanges}.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http()
 * })
 *
 * const filterId = await actions.createBlockFilter(client)
 * ```
 *
 * @param client - Client to use.
 * @returns Filter identifier.
 */
export async function createBlockFilter<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>): createBlockFilter.ReturnType {
  return await client.request({ method: 'eth_newBlockFilter' })
}

export declare namespace createBlockFilter {
  type ReturnType = Promise<Hex.Hex>
}
