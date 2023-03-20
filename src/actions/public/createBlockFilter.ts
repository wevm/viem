import type { PublicClientArg } from '../../clients'

import type { Filter } from '../../types'

export type CreateBlockFilterReturnType = Filter<'block'>

export async function createBlockFilter(
  client: PublicClientArg,
): Promise<CreateBlockFilterReturnType> {
  const id = await client.request({
    method: 'eth_newBlockFilter',
  })
  return { id, type: 'block' }
}
