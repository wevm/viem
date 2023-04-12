import type { PublicClient, Transport } from '../../clients/index.js'
import type { Chain, Filter } from '../../types/index.js'
import { createFilterRequestScope } from '../../utils/filters/createFilterRequestScope.js'

export type CreateBlockFilterReturnType = Filter<'block'>

/**
 * Creates a [`Filter`](https://viem.sh/docs/glossary/types.html#filter) to listen for new block hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
 *
 * - Docs: https://viem.sh/docs/actions/public/createBlockFilter.html
 * - JSON-RPC Methods: [`eth_newBlockFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newBlockFilter)
 *
 * @param client - Client to use
 * @returns [`Filter`](https://viem.sh/docs/glossary/types.html#filter). {@link CreateBlockFilterReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createBlockFilter } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createBlockFilter(client)
 * // { id: "0x345a6572337856574a76364e457a4366", type: 'block' }
 */
export async function createBlockFilter<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<CreateBlockFilterReturnType> {
  const getRequest = createFilterRequestScope(client, {
    method: 'eth_newBlockFilter',
  })
  const id = await client.request({
    method: 'eth_newBlockFilter',
  })
  return { id, request: getRequest(id), type: 'block' }
}
