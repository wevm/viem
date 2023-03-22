import type { Transport, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import { numberToHex } from '../../utils'

export type AddChainParameters = {
  chain: Chain
}

export async function addChain<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<TTransport, TChain, TAccount>,
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
