import type {
  PublicClient,
  WalletClient,
  Transport,
} from '../../clients/index.js'
import { BlockNotFoundError } from '../../errors/index.js'
import type {
  Account,
  BlockTag,
  Chain,
  Hash,
  RpcBlock,
} from '../../types/index.js'
import type { BlockFormatter, FormattedBlock } from '../../utils/index.js'
import { format, formatBlock, numberToHex } from '../../utils/index.js'

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

export type GetBlockReturnType<
  TChain extends Chain | undefined = Chain | undefined,
> = FormattedBlock<BlockFormatter<TChain>>

export async function getBlock<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client:
    | PublicClient<Transport, TChain>
    | WalletClient<Transport, TChain, TAccount>,
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
