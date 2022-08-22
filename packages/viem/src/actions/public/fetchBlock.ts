import { NetworkProvider } from '../../providers/network/createNetworkProvider'
import { WalletProvider } from '../../providers/wallet/createWalletProvider'
import { Block, BlockTag, Data } from '../../types/ethereum-provider'
import { BaseError, numberToHex } from '../../utils'

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
      blockNumber?: number
      blockTag?: never
    }
  | {
      blockHash?: never
      blockNumber?: never
      /** The block tag. Defaults to 'latest'. */
      blockTag?: BlockTag
    }
)

export type FetchBlockResponse = Block<bigint>

export async function fetchBlock(
  provider: NetworkProvider | WalletProvider,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
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
      params: [blockNumberHex || blockTag, includeTransactions],
    })
  }

  if (!block) throw new BlockNotFoundError({ blockHash, blockNumber })
  return deserializeBlock(block)
}

///////////////////////////////////////////////////////

// Serializers

export function deserializeBlock({
  baseFeePerGas,
  difficulty,
  extraData,
  gasLimit,
  gasUsed,
  hash,
  logsBloom,
  miner,
  mixHash,
  nonce,
  number,
  parentHash,
  receiptsRoot,
  sha3Uncles,
  size,
  stateRoot,
  timestamp,
  totalDifficulty,
  transactions,
  transactionsRoot,
  uncles,
}: Block): Block<bigint> {
  return {
    baseFeePerGas: baseFeePerGas ? BigInt(baseFeePerGas) : null,
    difficulty: BigInt(difficulty),
    extraData,
    gasLimit: BigInt(gasLimit),
    gasUsed: BigInt(gasUsed),
    hash,
    logsBloom,
    miner,
    mixHash,
    nonce,
    number: number ? BigInt(number) : null,
    parentHash,
    receiptsRoot,
    sha3Uncles,
    size: BigInt(size),
    stateRoot,
    timestamp: BigInt(timestamp),
    totalDifficulty: totalDifficulty ? BigInt(totalDifficulty) : null,
    transactions,
    transactionsRoot,
    uncles,
  }
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
    blockNumber?: number
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
