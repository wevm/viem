import type { Chain } from '../../chains'
import type { PublicClient, Transport } from '../../clients'
import type { BlockTag, Data, RpcTransaction } from '../../types'
import { BaseError, numberToHex } from '../../utils'
import type {
  FormattedTransaction,
  TransactionFormatter,
} from '../../utils/formatters/transaction'
import { formatTransaction } from '../../utils/formatters/transaction'

export type FetchTransactionArgs<TChain extends Chain = Chain> = {
  chain?: TChain
} & (
  | {
      blockHash: Data
      blockNumber?: never
      blockTag?: never
      hash?: never
      index: number
    }
  | {
      blockHash?: never
      blockNumber: bigint
      blockTag?: never
      hash?: never
      index: number
    }
  | {
      blockHash?: never
      blockNumber?: never
      blockTag: BlockTag
      hash?: never
      index: number
    }
  | {
      blockHash?: never
      blockNumber?: never
      blockTag?: never
      hash: Data
      index?: number
    }
)

export type FetchTransactionResponse<TChain extends Chain = Chain> =
  FormattedTransaction<TransactionFormatter<TChain>>

export async function fetchTransaction<TChain extends Chain>(
  client: PublicClient<Transport<any, any, TChain>>,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    chain = client.chain,
    hash,
    index,
  }: FetchTransactionArgs<TChain>,
): Promise<FetchTransactionResponse<TChain>> {
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

  return formatTransaction<TransactionFormatter<TChain>>(transaction, {
    formatter: chain?.formatters?.transaction,
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
    blockHash?: Data
    blockNumber?: bigint
    blockTag?: BlockTag
    hash?: Data
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
