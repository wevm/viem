import type { PublicClient, WalletClient } from '../../clients/index.js'
import type { Address, BlockTag } from '../../types/index.js'
import { hexToNumber, numberToHex } from '../../utils/index.js'

export type GetTransactionCountParameters = {
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
export type GetTransactionCountReturnType = number

/**
 * @description Returns the number of transactions an account has broadcast / sent.
 */
export async function getTransactionCount(
  client: PublicClient | WalletClient,
  { address, blockTag = 'latest', blockNumber }: GetTransactionCountParameters,
): Promise<GetTransactionCountReturnType> {
  const count = await client.request({
    method: 'eth_getTransactionCount',
    params: [address, blockNumber ? numberToHex(blockNumber) : blockTag],
  })
  return hexToNumber(count)
}
