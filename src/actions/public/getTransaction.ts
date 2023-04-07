import type { PublicClient, Transport } from '../../clients/index.js'
import { TransactionNotFoundError } from '../../errors/transaction.js'
import type {
  BlockTag,
  Chain,
  Hash,
  RpcTransaction,
} from '../../types/index.js'
import { format, numberToHex } from '../../utils/index.js'
import type {
  FormattedTransaction,
  TransactionFormatter,
} from '../../utils/formatters/transaction.js'
import { formatTransaction } from '../../utils/formatters/transaction.js'

export type GetTransactionParameters =
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

export type GetTransactionReturnType<TChain extends Chain | undefined = Chain> =
  FormattedTransaction<TransactionFormatter<TChain>>

/** @description Returns information about a transaction given a hash or block identifier. */
export async function getTransaction<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    hash,
    index,
  }: GetTransactionParameters,
): Promise<GetTransactionReturnType<TChain>> {
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
