import type { PublicClient, Transport } from '../../clients/index.js'
import type { Chain, Filter } from '../../types/index.js'
import { createFilterRequestScope } from '../../utils/filters/createFilterRequestScope.js'

export type CreatePendingTransactionFilterReturnType = Filter<'transaction'>

/**
 * Creates a Filter to listen for new pending transaction hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
 *
 * - Docs: https://viem.sh/docs/actions/public/createPendingTransactionFilter.html
 * - JSON-RPC Methods: [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter)
 *
 * @param client - Client to use
 * @returns [`Filter`](https://viem.sh/docs/glossary/types.html#filter). {@link CreateBlockFilterReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createPendingTransactionFilter } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createPendingTransactionFilter(client)
 * // { id: "0x345a6572337856574a76364e457a4366", type: 'transaction' }
 */
export async function createPendingTransactionFilter<
  TTransport extends Transport,
  TChain extends Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
): Promise<CreatePendingTransactionFilterReturnType> {
  const getRequest = createFilterRequestScope(client, {
    method: 'eth_newPendingTransactionFilter',
  })
  const id = await client.request({
    method: 'eth_newPendingTransactionFilter',
  })
  return { id, request: getRequest(id), type: 'transaction' }
}
