import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Filter } from '../../types/filter.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { createFilterRequestScope } from '../../utils/filters/createFilterRequestScope.js'

export type CreateBlockFilterReturnType = Filter<'block'>

export type CreateBlockFilterErrorType = RequestErrorType | ErrorType

/**
 * Creates a [`Filter`](https://viem.sh/docs/glossary/types#filter) to listen for new block hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
 *
 * - Docs: https://viem.sh/docs/actions/public/createBlockFilter
 * - JSON-RPC Methods: [`eth_newBlockFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newBlockFilter)
 *
 * @param client - Client to use
 * @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateBlockFilterReturnType}
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
  client: Client<Transport, TChain>,
): Promise<CreateBlockFilterReturnType> {
  const getRequest = createFilterRequestScope(client, {
    method: 'eth_newBlockFilter',
  })
  const id = await client.request({
    method: 'eth_newBlockFilter',
  })
  return { id, request: getRequest(id), type: 'block' }
}
