import type { WalletClient } from '../../clients/index.js'
import type { WatchAssetParams } from '../../types/eip1193.js'

export type WatchAssetParameters = WatchAssetParams
export type WatchAssetReturnType = boolean

export async function watchAsset(
  client: WalletClient,
  params: WatchAssetParameters,
): Promise<WatchAssetReturnType> {
  const added = await client.request({
    method: 'wallet_watchAsset',
    params: [params],
  })
  return added
}
