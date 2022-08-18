import { NetworkProvider } from '../../providers/network/createNetworkProvider'
import { WalletProvider } from '../../providers/wallet/createWalletProvider'

export type FetchBlockNumberResponse = number

export async function fetchBlockNumber(
  provider: NetworkProvider | WalletProvider,
): Promise<FetchBlockNumberResponse> {
  const blockNumber = await provider.request({
    method: 'eth_blockNumber',
  })
  return Number(BigInt(blockNumber))
}
