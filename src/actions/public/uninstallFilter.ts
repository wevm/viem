import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Filter } from '../../types/filter.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type UninstallFilterParameters = {
  filter: Filter<any>
}
export type UninstallFilterReturnType = boolean

export type UninstallFilterErrorType = RequestErrorType | ErrorType

/**
 * Destroys a [`Filter`](https://viem.sh/docs/glossary/types.html#filter).
 *
 * - Docs: https://viem.sh/docs/actions/public/uninstallFilter.html
 * - JSON-RPC Methods: [`eth_uninstallFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_uninstallFilter)
 *
 * Destroys a Filter that was created from one of the following Actions:
 * - [`createBlockFilter`](https://viem.sh/docs/actions/public/createBlockFilter.html)
 * - [`createEventFilter`](https://viem.sh/docs/actions/public/createEventFilter.html)
 * - [`createPendingTransactionFilter`](https://viem.sh/docs/actions/public/createPendingTransactionFilter.html)
 *
 * @param client - Client to use
 * @param parameters - {@link UninstallFilterParameters}
 * @returns A boolean indicating if the Filter was successfully uninstalled. {@link UninstallFilterReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createPendingTransactionFilter, uninstallFilter } from 'viem/public'
 *
 * const filter = await createPendingTransactionFilter(client)
 * const uninstalled = await uninstallFilter(client, { filter })
 * // true
 */
export async function uninstallFilter<
  TTransport extends Transport,
  TChain extends Chain | undefined,
>(
  _client: Client<TTransport, TChain>,
  { filter }: UninstallFilterParameters,
): Promise<UninstallFilterReturnType> {
  return filter.request({
    method: 'eth_uninstallFilter',
    params: [filter.id],
  })
}
