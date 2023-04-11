import type { PublicClient, Transport } from '../../clients/index.js'
import type { Chain, Filter } from '../../types/index.js'

export type UninstallFilterParameters = {
  filter: Filter<any>
}
export type UninstallFilterReturnType = boolean

export async function uninstallFilter<
  TTransport extends Transport,
  TChain extends Chain | undefined,
>(
  _client: PublicClient<TTransport, TChain>,
  { filter }: UninstallFilterParameters,
): Promise<UninstallFilterReturnType> {
  return filter.request({
    method: 'eth_uninstallFilter',
    params: [filter.id],
  })
}
