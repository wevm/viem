import type { Block } from './block'
import type {
  RpcBlock,
  RpcTransaction,
  RpcTransactionReceipt,
  RpcTransactionRequest,
} from './rpc'
import type {
  Transaction,
  TransactionReceipt,
  TransactionRequest,
} from './transaction'

export type Formatter<TSource = any, TTarget = any> = (
  value: TSource & { [key: string]: unknown },
) => TTarget

export type Formatters = {
  block?: Formatter<RpcBlock, Block>
  transaction?: Formatter<RpcTransaction, Transaction>
  transactionReceipt?: Formatter<RpcTransactionReceipt, TransactionReceipt>
  transactionRequest?: Formatter<TransactionRequest, RpcTransactionRequest>
}
