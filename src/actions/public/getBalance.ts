import type { PublicClient, Transport } from '../../clients/index.js'
import type { Address, BlockTag, Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type GetBalanceParameters = {
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

export type GetBalanceReturnType = bigint

/**
 * @description Returns the balance of an address in wei.
 */
export async function getBalance<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  { address, blockNumber, blockTag = 'latest' }: GetBalanceParameters,
): Promise<GetBalanceReturnType> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const balance = await client.request({
    method: 'eth_getBalance',
    params: [address, blockNumberHex || blockTag],
  })
  return BigInt(balance)
}
