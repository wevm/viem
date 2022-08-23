import { NetworkProvider } from '../../providers/network/createNetworkProvider'
import { WalletProvider } from '../../providers/wallet/createWalletProvider'
import { Address, BlockTag } from '../../types/ethereum-provider'
import { numberToHex } from '../../utils'

export type FetchBalanceArgs = {
  address: Address
} & (
  | {
      blockNumber?: number
      blockTag?: never
    }
  | {
      blockNumber?: never
      blockTag?: BlockTag
    }
)

export type FetchBalanceResponse = bigint

export async function fetchBalance(
  provider: NetworkProvider | WalletProvider,
  { address, blockNumber, blockTag = 'latest' }: FetchBalanceArgs,
): Promise<FetchBalanceResponse> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const balance = await provider.request({
    method: 'eth_getBalance',
    params: [address, blockNumberHex || blockTag],
  })
  return BigInt(balance)
}
