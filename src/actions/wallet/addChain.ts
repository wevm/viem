import type { Client, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import { numberToHex } from '../../utils'

export type AddChainParameters = {
  chain: Chain
}

export async function addChain<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: WalletClient<TChain, TAccount> | Client<TChain>,
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
