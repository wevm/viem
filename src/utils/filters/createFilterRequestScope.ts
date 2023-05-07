import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { OnResponseFn } from '../../clients/transports/fallback.js'
import type { Chain } from '../../types/chain.js'
import type { Requests } from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'

type CreateFilterRequestScopeParameters = {
  method:
    | 'eth_newFilter'
    | 'eth_newPendingTransactionFilter'
    | 'eth_newBlockFilter'
}
// TODO: Narrow `request` to filter-based methods (ie. `eth_getFilterLogs`, etc).
type CreateFilterRequestScopeReturnType = (id: Hex) => Requests['request']

/**
 * Scopes `request` to the filter ID. If the client is a fallback, it will
 * listen for responses and scope the child transport `request` function
 * to the successful filter ID.
 */
export function createFilterRequestScope<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  { method }: CreateFilterRequestScopeParameters,
): CreateFilterRequestScopeReturnType {
  const requestMap: Record<Hex, PublicClient<Transport, TChain>['request']> = {}

  if (client.transport.type === 'fallback')
    client.transport.onResponse?.(
      ({
        method: method_,
        response: id,
        status,
        transport,
      }: Parameters<OnResponseFn>[0]) => {
        if (status === 'success' && method === method_)
          requestMap[id as Hex] = transport.request
      },
    )

  return ((id) =>
    requestMap[id] || client.request) as CreateFilterRequestScopeReturnType
}
