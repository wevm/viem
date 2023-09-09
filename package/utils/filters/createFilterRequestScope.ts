import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { OnResponseFn } from '../../clients/transports/fallback.js'
import type { Chain } from '../../types/chain.js'
import type { PublicRpcSchema } from '../../types/eip1193.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import type { Filter } from '../../types/utils.js'

type CreateFilterRequestScopeParameters = {
  method:
    | 'eth_newFilter'
    | 'eth_newPendingTransactionFilter'
    | 'eth_newBlockFilter'
}

type FilterRpcSchema = Filter<
  PublicRpcSchema,
  { Method: 'eth_getFilterLogs' | 'eth_getFilterChanges' }
>

type CreateFilterRequestScopeReturnType = (
  id: Hex,
) => EIP1193RequestFn<FilterRpcSchema>

/**
 * Scopes `request` to the filter ID. If the client is a fallback, it will
 * listen for responses and scope the child transport `request` function
 * to the successful filter ID.
 */
export function createFilterRequestScope<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  { method }: CreateFilterRequestScopeParameters,
): CreateFilterRequestScopeReturnType {
  const requestMap: Record<Hex, EIP1193RequestFn> = {}

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
