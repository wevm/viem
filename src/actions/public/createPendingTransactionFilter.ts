import type { PublicClient } from '../../clients'

import type { Filter } from '../../types'

export type CreatePendingTransactionFilterReturnType = Filter<'transaction'>

export async function createPendingTransactionFilter(
  client: PublicClient,
): Promise<CreatePendingTransactionFilterReturnType> {
  const id = await client.request({
    method: 'eth_newPendingTransactionFilter',
  })
  return { id, type: 'transaction' }
}
