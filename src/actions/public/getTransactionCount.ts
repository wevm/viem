import type { PublicClient, WalletClient } from '../../clients'
import type { Address, BlockTag } from '../../types'
import { hexToNumber, numberToHex } from '../../utils'

export type GetTransactionCountArgs = {
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
export type GetTransactionCountResponse = number

/**
 * @description Returns the number of transactions an account has broadcast / sent.
 */
export async function getTransactionCount(
  client: PublicClient | WalletClient,
  { address, blockTag = 'latest', blockNumber }: GetTransactionCountArgs,
): Promise<GetTransactionCountResponse> {
  const count = await client.request({
    method: 'eth_getTransactionCount',
    params: [address, blockNumber ? numberToHex(blockNumber) : blockTag],
  })
  return hexToNumber(count)
}
