import type { WalletClient } from '../../clients'
import type { WatchAssetParams } from '../../types/eip1193'

export type WatchAssetArgs = WatchAssetParams
export type WatchAssetResponse = boolean

export async function watchAsset(
  client: WalletClient,
  params: WatchAssetParams,
): Promise<WatchAssetResponse> {
  const added = await client.request({
    method: 'wallet_watchAsset',
    params: [params],
  })
  return added
}
