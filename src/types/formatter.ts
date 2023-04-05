import type { Block } from './block.js'
import type {
  RpcBlock,
  RpcTransaction,
  RpcTransactionReceipt,
  RpcTransactionRequest,
} from './rpc.js'
import type {
  Transaction,
  TransactionReceipt,
  TransactionRequest,
} from './transaction.js'

export type Formatter<TSource = any, TTarget = any> = (
  value: TSource & { [key: string]: unknown },
) => TTarget

export type Formatters = {
  block?: Formatter<RpcBlock, Block>
  transaction?: Formatter<RpcTransaction, Transaction>
  transactionReceipt?: Formatter<RpcTransactionReceipt, TransactionReceipt>
  transactionRequest?: Formatter<TransactionRequest, RpcTransactionRequest>
}
