import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Hex from '../../utils/Hex.js'

/**
 * Creates a filter to listen for new pending transaction hashes that can be
 * used with {@link actions.getFilterChanges}.
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
 * const filterId =
 *   await actions.createPendingTransactionFilter(client)
 * ```
 *
 * @param client - Client to use.
 * @returns Filter identifier.
 */
export async function createPendingTransactionFilter<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(client: Client.Client<chain>): createPendingTransactionFilter.ReturnType {
  return await client.request({ method: 'eth_newPendingTransactionFilter' })
}

export declare namespace createPendingTransactionFilter {
  type ReturnType = Promise<Hex.Hex>
}
