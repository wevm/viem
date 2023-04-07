import type { Transport, WalletClient } from '../../clients/index.js'
import type { Account, Chain } from '../../types/index.js'
import type { WatchAssetParams } from '../../types/eip1193.js'

export type WatchAssetParameters = WatchAssetParams
export type WatchAssetReturnType = boolean

export async function watchAsset<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<Transport, TChain, TAccount>,
  params: WatchAssetParameters,
): Promise<WatchAssetReturnType> {
  const added = await client.request({
    method: 'wallet_watchAsset',
    params: [params],
  })
  return added
}
