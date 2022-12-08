import type { PublicClient } from '../../clients'
import type { Address, BlockTag } from '../../types'
import { numberToHex } from '../../utils'

export type FetchBalanceArgs = {
  /** The address of the account. */
  address: Address
} & (
  | {
      /** The balance of the account at a block number. */
      blockNumber?: bigint
      blockTag?: never
    }
  | {
      blockNumber?: never
      /** The balance of the account at a block tag. */
      blockTag?: BlockTag
    }
)

export type FetchBalanceResponse = bigint

/**
 * @description Returns the balance of an address in wei.
 */
export async function fetchBalance(
  client: PublicClient,
  { address, blockNumber, blockTag = 'latest' }: FetchBalanceArgs,
): Promise<FetchBalanceResponse> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const balance = await client.request({
    method: 'eth_getBalance',
    params: [address, blockNumberHex || blockTag],
  })
  return BigInt(balance)
}
