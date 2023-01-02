import type { PublicClient } from '../../clients'
import type { Filter } from '../../types'

export type UninstallFilterArgs = {
  filter: Filter<any>
}
export type UninstallFilterResponse = boolean

export async function uninstallFilter(
  client: PublicClient,
  { filter }: UninstallFilterArgs,
): Promise<UninstallFilterResponse> {
  return client.request({
    method: 'eth_uninstallFilter',
    params: [filter.id],
  })
}
