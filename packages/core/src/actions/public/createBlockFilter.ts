import type { PublicClient } from '../../clients'

import type { Filter } from '../../types'

export type CreateBlockFilterResponse = Filter<'block'>

export async function createBlockFilter(
  client: PublicClient,
): Promise<CreateBlockFilterResponse> {
  const id = await client.request({
    method: 'eth_newBlockFilter',
  })
  return { id, type: 'block' }
}
