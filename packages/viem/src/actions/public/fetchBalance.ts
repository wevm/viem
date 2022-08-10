import { BaseProvider } from '../../providers'
import { Address, BlockTime } from '../../types/ethereum-provider'
import { numberToHex } from '../../utils'

export type FetchBalanceArgs = {
  address: Address
} & (
  | {
      blockNumber?: number
      blockTime?: never
    }
  | {
      blockNumber?: never
      blockTime?: BlockTime
    }
)

export type FetchBalanceResponse = bigint

export async function fetchBalance<TProvider extends BaseProvider>(
  provider: TProvider,
  { address, blockNumber, blockTime = 'latest' }: FetchBalanceArgs,
): Promise<FetchBalanceResponse> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const balance = await provider.request({
    method: 'eth_getBalance',
    params: [address, blockNumberHex || blockTime],
  })
  return BigInt(balance)
}
