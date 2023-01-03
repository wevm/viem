import type { Chain } from '../../chains'
import type { PublicClient } from '../../clients'
import type { BlockTag, Hash, RpcTransaction } from '../../types'
import { BaseError, format, numberToHex } from '../../utils'
import type {
  FormattedTransaction,
  TransactionFormatter,
} from '../../utils/formatters/transaction'
import { formatTransaction } from '../../utils/formatters/transaction'

export type GetTransactionArgs =
  | {
      /** The block hash */
      blockHash: Hash
      blockNumber?: never
      blockTag?: never
      hash?: never
      /** The index of the transaction on the block. */
      index: number
    }
  | {
      blockHash?: never
      /** The block number */
      blockNumber: bigint
      blockTag?: never
      hash?: never
      /** The index of the transaction on the block. */
      index: number
    }
  | {
      blockHash?: never
      blockNumber?: never
      /** The block tag. */
      blockTag: BlockTag
      hash?: never
      /** The index of the transaction on the block. */
      index: number
    }
  | {
      blockHash?: never
      blockNumber?: never
      blockTag?: never
      /** The hash of the transaction. */
      hash: Hash
      index?: number
    }

export type GetTransactionResponse<TChain extends Chain = Chain> =
  FormattedTransaction<TransactionFormatter<TChain>>

/** @description Returns information about a transaction given a hash or block identifier. */
export async function getTransaction<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    hash,
    index,
  }: GetTransactionArgs,
): Promise<GetTransactionResponse<TChain>> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let transaction: RpcTransaction | null = null
  if (hash) {
    transaction = await client.request({
      method: 'eth_getTransactionByHash',
      params: [hash],
    })
  } else if (blockHash) {
    transaction = await client.request({
      method: 'eth_getTransactionByBlockHashAndIndex',
      params: [blockHash, numberToHex(index)],
    })
  } else if (blockNumberHex || blockTag) {
    transaction = await client.request({
      method: 'eth_getTransactionByBlockNumberAndIndex',
      params: [blockNumberHex || blockTag, numberToHex(index)],
    })
  }

  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash,
      index,
    })

  return format(transaction, {
    formatter: client.chain?.formatters?.transaction || formatTransaction,
  })
}

///////////////////////////////////////////////////////

// Errors

export class TransactionNotFoundError extends BaseError {
  name = 'TransactionNotFoundError'
  constructor({
    blockHash,
    blockNumber,
    blockTag,
    hash,
    index,
  }: {
    blockHash?: Hash
    blockNumber?: bigint
    blockTag?: BlockTag
    hash?: Hash
    index?: number
  }) {
    let identifier = 'Transaction'
    if (blockTag && index !== undefined)
      identifier = `Transaction at block time "${blockTag}" at index "${index}"`
    if (blockHash && index !== undefined)
      identifier = `Transaction at block hash "${blockHash}" at index "${index}"`
    if (blockNumber && index !== undefined)
      identifier = `Transaction at block number "${blockNumber}" at index "${index}"`
    if (hash) identifier = `Transaction with hash "${hash}"`
    super({
      humanMessage: `${identifier} could not be found.`,
      details: 'transaction not found',
    })
  }
}
