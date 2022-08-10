import { BaseProvider } from '../../providers'
import { Block, BlockTime, Data } from '../../types/ethereum-provider'
import { BlockNotFoundError, numberToHex } from '../../utils'

export type FetchBlockArgs = {
  includeTransactions?: boolean
} & (
  | {
      blockHash?: Data
      blockNumber?: never
      blockTime?: never
    }
  | {
      blockHash?: never
      blockNumber?: number
      blockTime?: never
    }
  | {
      blockHash?: never
      blockNumber?: never
      blockTime?: BlockTime
    }
)

export type FetchBlockResponse = Block

export async function fetchBlock<TProvider extends BaseProvider>(
  provider: TProvider,
  {
    blockHash,
    blockNumber,
    blockTime,
    includeTransactions = false,
  }: FetchBlockArgs = {},
): Promise<FetchBlockResponse> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let block: Block | null = null
  if (blockHash) {
    block = await provider.request({
      method: 'eth_getBlockByHash',
      params: [blockHash, includeTransactions],
    })
  } else {
    block = await provider.request({
      method: 'eth_getBlockByNumber',
      params: [blockTime || blockNumberHex || 'latest', includeTransactions],
    })
  }

  if (!block) throw new BlockNotFoundError({ blockHash, blockNumber })
  // TODO: prettify response
  return block
}
