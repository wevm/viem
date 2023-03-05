import type { WalletClient } from '../../clients'
import type { Chain } from '../../types'
import { numberToHex } from '../../utils'

export type AddChainParameters = {
  chain: Chain
}

export async function addChain(
  client: WalletClient,
  { chain }: AddChainParameters,
) {
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
