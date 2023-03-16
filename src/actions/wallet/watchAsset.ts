import type { WalletClient } from '../../clients'
import type { WatchAssetParams } from '../../types/eip1193'

export type WatchAssetParameters = WatchAssetParams
export type WatchAssetReturnType = boolean

export async function watchAsset(
  client: WalletClient<any, any>,
  params: WatchAssetParameters,
): Promise<WatchAssetReturnType> {
  const added = await client.request({
    method: 'wallet_watchAsset',
    params: [params],
  })
  return added
}
