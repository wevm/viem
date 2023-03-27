import type { PublicClient } from '../../clients/index.js'

import type { Filter } from '../../types/index.js'

export type CreatePendingTransactionFilterReturnType = Filter<'transaction'>

export async function createPendingTransactionFilter(
  client: PublicClient,
): Promise<CreatePendingTransactionFilterReturnType> {
  const id = await client.request({
    method: 'eth_newPendingTransactionFilter',
  })
  return { id, type: 'transaction' }
}
