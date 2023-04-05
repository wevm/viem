import type { Client, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import type { WatchAssetParams } from '../../types/eip1193'

export type WatchAssetParameters = WatchAssetParams
export type WatchAssetReturnType = boolean

export async function watchAsset<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<TChain, TAccount> | Client<TChain>,
  params: WatchAssetParameters,
): Promise<WatchAssetReturnType> {
  const added = await client.request({
    method: 'wallet_watchAsset',
    params: [params],
  })
  return added
}
