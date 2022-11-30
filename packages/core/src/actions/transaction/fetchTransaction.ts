import { NetworkRpc } from '../../rpcs/createNetworkRpc'
import {
  BlockTag,
  Data,
  RpcTransactionResult,
  TransactionResult,
} from '../../types'
import {
  BaseError,
  deserializeTransactionResult,
  numberToHex,
} from '../../utils'

export type FetchTransactionArgs =
  | {
      blockHash: Data
      blockNumber?: never
      blockTag?: never
      hash?: never
      index: number
    }
  | {
      blockHash?: never
      blockNumber: number
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

export type FetchTransactionResponse = TransactionResult

export async function fetchTransaction(
  rpc: NetworkRpc,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    hash,
    index,
  }: FetchTransactionArgs,
): Promise<FetchTransactionResponse> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let transaction: RpcTransactionResult | null = null
  if (hash) {
    transaction = await rpc.request({
      method: 'eth_getTransactionByHash',
      params: [hash],
    })
  } else if (blockHash) {
    transaction = await rpc.request({
      method: 'eth_getTransactionByBlockHashAndIndex',
      params: [blockHash, numberToHex(index)],
    })
  } else if (blockNumberHex || blockTag) {
    transaction = await rpc.request({
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
  return deserializeTransactionResult(transaction)
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
    blockNumber?: number
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
