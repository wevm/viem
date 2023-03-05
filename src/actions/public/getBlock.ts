import type { PublicClient, WalletClient } from '../../clients'
import { BlockNotFoundError } from '../../errors'
import type { BlockTag, Chain, Hash, RpcBlock } from '../../types'
import type { BlockFormatter, FormattedBlock } from '../../utils'
import { format, formatBlock, numberToHex } from '../../utils'

export type GetBlockParameters = {
  /** Whether or not to include transaction data in the response. */
  includeTransactions?: boolean
} & (
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
)

export type GetBlockReturnType<TChain extends Chain = Chain> = FormattedBlock<
  BlockFormatter<TChain>
>

export async function getBlock<TChain extends Chain>(
  client: PublicClient<any, TChain> | WalletClient,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    includeTransactions = false,
  }: GetBlockParameters = {},
): Promise<GetBlockReturnType<TChain>> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let block: RpcBlock | null = null
  if (blockHash) {
    block = await client.request({
      method: 'eth_getBlockByHash',
      params: [blockHash, includeTransactions],
    })
  } else {
    block = await client.request({
      method: 'eth_getBlockByNumber',
      params: [blockNumberHex || blockTag, includeTransactions],
    })
  }

  if (!block) throw new BlockNotFoundError({ blockHash, blockNumber })

  return format(block, {
    formatter: client.chain?.formatters?.block || formatBlock,
  })
}
