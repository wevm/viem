import type { PublicClient } from '../../clients'
import type { Address, BlockTag } from '../../types'
import { hexToNumber, numberToHex } from '../../utils'

export type FetchTransactionCountArgs = {
  /** The account address. */
  address: Address
} & (
  | {
      /** The block number. */
      blockNumber?: bigint
      blockTag?: never
    }
  | {
      blockNumber?: never
      /** The block tag. Defaults to 'latest'. */
      blockTag?: BlockTag
    }
)
export type FetchTransactionCountResponse = number

/**
 * @description Returns the number of transactions an account has broadcast / sent.
 */
export async function fetchTransactionCount(
  client: PublicClient,
  { address, blockTag = 'latest', blockNumber }: FetchTransactionCountArgs,
): Promise<FetchTransactionCountResponse> {
  const count = await client.request({
    method: 'eth_getTransactionCount',
    params: [address, blockNumber ? numberToHex(blockNumber) : blockTag],
  })
  return hexToNumber(count ?? '0x0')
}
