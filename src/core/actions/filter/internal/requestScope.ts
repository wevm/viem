import type * as Client from '../../../Client.js'
import type * as Transport from '../../../Transport.js'
import type { OnResponse } from '../../../transports/fallback.js'

/** The `eth_new*Filter` method a filter was created with. */
export type Method =
  | 'eth_newBlockFilter'
  | 'eth_newFilter'
  | 'eth_newPendingTransactionFilter'

/**
 * Returns a function that resolves the {@link Transport.RequestFn} for a freshly
 * minted filter id.
 *
 * On a `fallback` transport the filter id only exists on the underlying RPC that
 * created it, so we listen for the `eth_new*Filter` response and bind the id to
 * the child transport that produced it. For every other transport (and any id we
 * never saw created) the resolver returns `client.request`.
 */
export function requestScope(
  client: Client.Client,
  options: requestScope.Options,
): (id: string) => Transport.RequestFn {
  const { method } = options
  const requestMap: Record<string, Transport.RequestFn> = {}

  const transport = client.transport as {
    onResponse?: ((fn: OnResponse) => void) | undefined
  }
  if (typeof transport.onResponse === 'function')
    transport.onResponse((response) => {
      if (response.status === 'success' && response.method === method)
        requestMap[response.response as string] = response.transport.request
    })

  return (id) => requestMap[id] ?? client.request
}

export declare namespace requestScope {
  type Options = {
    /** Method the filter is created with. */
    method: Method
  }
}
