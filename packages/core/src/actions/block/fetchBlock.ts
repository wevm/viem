import type { Chain } from '../../chains'
import type { PublicClient } from '../../clients'
import type { BlockTag, Data, RpcBlock } from '../../types'
import type { BlockFormatter, FormattedBlock } from '../../utils'
import { BaseError, format, formatBlock, numberToHex } from '../../utils'

export type FetchBlockArgs = {
  /** Whether or not to include transaction data in the response. */
  includeTransactions?: boolean
} & (
  | {
      /** Hash of the block. */
      blockHash?: Data
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

export type FetchBlockResponse<TChain extends Chain = Chain> = FormattedBlock<
  BlockFormatter<TChain>
>

export async function fetchBlock<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    includeTransactions = false,
  }: FetchBlockArgs = {},
): Promise<FetchBlockResponse<TChain>> {
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

///////////////////////////////////////////////////////

// Errors

export class BlockNotFoundError extends BaseError {
  name = 'BlockNotFoundError'
  constructor({
    blockHash,
    blockNumber,
  }: {
    blockHash?: Data
    blockNumber?: bigint
  }) {
    let identifier = 'Block'
    if (blockHash) identifier = `Block at hash "${blockHash}"`
    if (blockNumber) identifier = `Block at number "${blockNumber}"`
    super({
      humanMessage: `${identifier} could not be found.`,
      details: 'block not found at given hash or number',
    })
  }
}
