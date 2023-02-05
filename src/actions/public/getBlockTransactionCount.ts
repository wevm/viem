import type { PublicClient } from '../../clients'
import type { BlockTag, Chain, Hash, Quantity } from '../../types'
import { hexToNumber, numberToHex } from '../../utils'

export type GetBlockTransactionCountArgs =
  | {
      /** Hash of the block. */
      blockHash?: Hash
      blockNumber?: never
      blockTag?: never
    }
  | {
      blockHash?: never
      /** The block number. */
      blockNumber?: bigint
      blockTag?: never
    }
  | {
      blockHash?: never
      blockNumber?: never
      /** The block tag. Defaults to 'latest'. */
      blockTag?: BlockTag
    }

export type GetBlockTransactionCountResponse = number

export async function getBlockTransactionCount<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
  }: GetBlockTransactionCountArgs = {},
): Promise<GetBlockTransactionCountResponse> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let count: Quantity | null = null
  if (blockHash) {
    count = await client.request({
      method: 'eth_getBlockTransactionCountByHash',
      params: [blockHash],
    })
  } else {
    count = await client.request({
      method: 'eth_getBlockTransactionCountByNumber',
      params: [blockNumberHex || blockTag],
    })
  }

  return hexToNumber(count)
}
