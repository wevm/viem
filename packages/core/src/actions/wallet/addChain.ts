import type { Chain } from '../../chains'
import type { WalletClient } from '../../clients'
import type { WatchAssetParams } from '../../types/eip1193'
import { numberToHex } from '../../utils'

export type WatchAssetArgs = WatchAssetParams
export type WatchAssetResponse = boolean

export async function addChain(client: WalletClient, chain: Chain) {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain
  await client.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers
          ? Object.values(blockExplorers).map(({ url }) => url)
          : undefined,
      },
    ],
  })
}
