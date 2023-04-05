import type { Client, PublicClient } from '../../clients'
import type { Chain, Filter } from '../../types'

export type CreateBlockFilterReturnType = Filter<'block'>

export async function createBlockFilter<TChain extends Chain | undefined>(
  client: PublicClient<TChain> | Client<TChain>,
): Promise<CreateBlockFilterReturnType> {
  const id = await client.request({
    method: 'eth_newBlockFilter',
  })
  return { id, type: 'block' }
}
