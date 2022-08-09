import { BaseProvider } from '../../providers'
import { Address, BlockTime } from '../../types'
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

export async function fetchBalance<TProvider extends BaseProvider>(
  provider: TProvider,
  { address, blockNumber, blockTime }: FetchBalanceArgs,
) {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const balance = await provider.request({
    method: 'eth_getBalance',
    params: [address, blockTime || blockNumberHex || 'latest'],
  })
  return BigInt(balance)
}
