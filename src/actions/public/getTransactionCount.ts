import type { PublicClient, WalletClient } from '../../clients'
import type { Account, Address, BlockTag } from '../../types'
import { hexToNumber, numberToHex } from '../../utils'

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
export async function getTransactionCount<TAccount extends Account | undefined>(
  client: PublicClient | WalletClient<any, any, TAccount>,
  { address, blockTag = 'latest', blockNumber }: GetTransactionCountParameters,
): Promise<GetTransactionCountReturnType> {
  const count = await client.request({
    method: 'eth_getTransactionCount',
    params: [address, blockNumber ? numberToHex(blockNumber) : blockTag],
  })
  return hexToNumber(count)
}
