import { NetworkRpc } from '../../rpcs'
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
  rpc: NetworkRpc,
  { address, blockNumber, blockTag = 'latest' }: FetchBalanceArgs,
): Promise<FetchBalanceResponse> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const balance = await rpc.request({
    method: 'eth_getBalance',
    params: [address, blockNumberHex || blockTag],
  })
  return BigInt(balance)
}
