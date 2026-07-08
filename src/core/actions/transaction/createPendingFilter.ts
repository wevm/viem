import type { Errors } from 'ox'

import type * as Client from '../../Client.js'
import type { Filter } from '../filter/Filter.js'
import { requestScope } from '../filter/internal/requestScope.js'

/**
 * Creates a filter to listen for new pending transaction hashes
 * (`eth_newPendingTransactionFilter`).
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
 * const filter = await Actions.transaction.createPendingFilter(client)
 * const changes = await Actions.filter.getChanges(client, { filter })
 * ```
 */
export async function createPendingFilter(
  client: Client.Client,
): Promise<createPendingFilter.ReturnType> {
  const getRequest = requestScope(client, {
    method: 'eth_newPendingTransactionFilter',
  })
  const id = await client.request({
    method: 'eth_newPendingTransactionFilter',
  })
  return { id, request: getRequest(id), type: 'transaction' }
}

export declare namespace createPendingFilter {
  type ReturnType = Filter<'transaction'>

  type ErrorType = Errors.GlobalErrorType
}
