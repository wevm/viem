import type { PublicClient, Transport } from '../../clients/index.js'
import type { OnResponseFn } from '../../clients/transports/fallback.js'
import type { Requests } from '../../types/eip1193.js'
import type { Chain, Filter } from '../../types/index.js'

export type CreateBlockFilterReturnType = Filter<'block'>

export async function createBlockFilter<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<CreateBlockFilterReturnType> {
  let request = client.request

  // If the transport is a fallback, we want to scope the request function
  // to the successful child transport. This is because we want to keep the
  // request function scoped & don't want to apply the fallback behavior to
  // methods such as `eth_getFilterChanges`, `eth_getFilterLogs`, etc.
  if (client.transport.type === 'fallback')
    client.transport.onResponse(
      ({ method, status, transport }: Parameters<OnResponseFn>[0]) => {
        if (status === 'success' && method === 'eth_newBlockFilter') {
          request = transport.request
        }
      },
    )

  const id = await client.request({
    method: 'eth_newBlockFilter',
  })
  return { id, request: request as Requests['request'], type: 'block' }
}
