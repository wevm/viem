import { Block } from './block'
import {
  RpcBlock,
  RpcTransaction,
  RpcTransactionReceipt,
  RpcTransactionRequest,
} from './rpc'
import {
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
