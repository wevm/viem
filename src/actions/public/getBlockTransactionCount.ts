import type { PublicClient, Transport } from '../../clients/index.js'
import type { BlockTag, Chain, Hash, Quantity } from '../../types/index.js'
import { hexToNumber, numberToHex } from '../../utils/index.js'

export type GetBlockTransactionCountParameters =
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

export type GetBlockTransactionCountReturnType = number

export async function getBlockTransactionCount<
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
  }: GetBlockTransactionCountParameters = {},
): Promise<GetBlockTransactionCountReturnType> {
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
