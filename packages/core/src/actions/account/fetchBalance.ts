import { NetworkClient } from '../../clients'
import { Address, BlockTag } from '../../types'
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
  client: NetworkClient,
  { address, blockNumber, blockTag = 'latest' }: FetchBalanceArgs,
): Promise<FetchBalanceResponse> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const balance = await client.request({
    method: 'eth_getBalance',
    params: [address, blockNumberHex || blockTag],
  })
  return BigInt(balance)
}
