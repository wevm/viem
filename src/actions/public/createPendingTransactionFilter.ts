import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Filter } from '../../types/filter.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { createFilterRequestScope } from '../../utils/filters/createFilterRequestScope.js'

export type CreatePendingTransactionFilterReturnType = Filter<'transaction'>

export type CreatePendingTransactionFilterErrorType =
  | RequestErrorType
  | ErrorType

/**
 * Creates a Filter to listen for new pending transaction hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
 *
 * - Docs: https://viem.sh/docs/actions/public/createPendingTransactionFilter
 * - JSON-RPC Methods: [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter)
 *
 * @param client - Client to use
 * @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateBlockFilterReturnType}
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
  transport extends Transport,
  chain extends Chain | undefined,
>(
  client: Client<transport, chain>,
): Promise<CreatePendingTransactionFilterReturnType> {
  const getRequest = createFilterRequestScope(client, {
    method: 'eth_newPendingTransactionFilter',
  })
  const id = await client.request({
    method: 'eth_newPendingTransactionFilter',
  })
  return { id, request: getRequest(id), type: 'transaction' }
}
