import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type { Filter } from '../filter/Filter.js'
import { requestScope } from '../filter/internal/requestScope.js'

/**
 * Creates a filter to listen for new block hashes (`eth_newBlockFilter`).
 *
 * The returned filter can be polled with {@link Actions.filter.getChanges} and
 * torn down with {@link Actions.filter.uninstall}.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await Actions.block.createFilter(client)
 * const changes = await Actions.filter.getChanges(client, { filter })
 * ```
 */
export async function createFilter(
  client: Client.Client,
): Promise<createFilter.ReturnType> {
  const getRequest = requestScope(client, { method: 'eth_newBlockFilter' })
  const id = await client.request({ method: 'eth_newBlockFilter' })
  return { id, request: getRequest(id), type: 'block' }
}

export declare namespace createFilter {
  type ReturnType = Filter<'block'>

  type ErrorType = Errors.GlobalErrorType
}
