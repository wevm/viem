import type { PublicClient } from '../../clients/index.js'
import type { Filter } from '../../types/index.js'

export type UninstallFilterParameters = {
  filter: Filter<any>
}
export type UninstallFilterReturnType = boolean

export async function uninstallFilter(
  client: PublicClient,
  { filter }: UninstallFilterParameters,
): Promise<UninstallFilterReturnType> {
  return client.request({
    method: 'eth_uninstallFilter',
    params: [filter.id],
  })
}
