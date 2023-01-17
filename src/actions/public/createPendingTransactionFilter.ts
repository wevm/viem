import type { PublicClient } from '../../clients'

import type { Filter } from '../../types'

export type CreatePendingTransactionFilterResponse = Filter<'transaction'>

export async function createPendingTransactionFilter(
  client: PublicClient,
): Promise<CreatePendingTransactionFilterResponse> {
  const id = await client.request({
    method: 'eth_newPendingTransactionFilter',
  })
  return { id, type: 'transaction' }
}
