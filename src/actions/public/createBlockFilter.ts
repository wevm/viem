import type { PublicClient } from '../../clients/index.js'

import type { Filter } from '../../types/index.js'

export type CreateBlockFilterReturnType = Filter<'block'>

export async function createBlockFilter(
  client: PublicClient,
): Promise<CreateBlockFilterReturnType> {
  const id = await client.request({
    method: 'eth_newBlockFilter',
  })
  return { id, type: 'block' }
}
