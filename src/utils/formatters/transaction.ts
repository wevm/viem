import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type {
  ExtractChainFormatterExclude,
  ExtractChainFormatterReturnType,
} from '../../types/chain.js'
import type { RpcTransaction } from '../../types/rpc.js'
import type { Transaction } from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import { hexToNumber } from '../encoding/fromHex.js'
import { type DefineFormatterErrorType, defineFormatter } from './formatter.js'

type TransactionPendingDependencies =
  | 'blockHash'
  | 'blockNumber'
  | 'transactionIndex'

export type FormattedTransaction<
  TChain extends { formatters?: Chain['formatters'] } | undefined =
    | { formatters?: Chain['formatters'] }
    | undefined,
  TBlockTag extends BlockTag = BlockTag,
  _FormatterReturnType = ExtractChainFormatterReturnType<
    TChain,
    'transaction',
    Transaction
  >,
  _ExcludedPendingDependencies extends string = TransactionPendingDependencies &
    ExtractChainFormatterExclude<TChain, 'transaction'>,
> = UnionOmit<_FormatterReturnType, TransactionPendingDependencies> & {
  [K in _ExcludedPendingDependencies]: never
} & Pick<
    Transaction<bigint, number, TBlockTag extends 'pending' ? true : false>,
    TransactionPendingDependencies
  >

export const transactionType = {
  '0x0': 'legacy',
  '0x1': 'eip2930',
  '0x2': 'eip1559',
} as const

export type FormatTransactionErrorType = ErrorType

export function formatTransaction(transaction: Partial<RpcTransaction>) {
  const transaction_ = {
    ...transaction,
    blockHash: transaction.blockHash ? transaction.blockHash : null,
    blockNumber: transaction.blockNumber
      ? BigInt(transaction.blockNumber)
      : null,
    chainId: transaction.chainId ? hexToNumber(transaction.chainId) : undefined,
    gas: transaction.gas ? BigInt(transaction.gas) : undefined,
    gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
    maxFeePerGas: transaction.maxFeePerGas
      ? BigInt(transaction.maxFeePerGas)
      : undefined,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
      ? BigInt(transaction.maxPriorityFeePerGas)
      : undefined,
    nonce: transaction.nonce ? hexToNumber(transaction.nonce) : undefined,
    to: transaction.to ? transaction.to : null,
    transactionIndex: transaction.transactionIndex
      ? Number(transaction.transactionIndex)
      : null,
    type: transaction.type ? transactionType[transaction.type] : undefined,
    typeHex: transaction.type ? transaction.type : undefined,
    value: transaction.value ? BigInt(transaction.value) : undefined,
    v: transaction.v ? BigInt(transaction.v) : undefined,
  }

  if (transaction_.type === 'legacy') {
    delete transaction_.accessList
    delete transaction_.maxFeePerGas
    delete transaction_.maxPriorityFeePerGas
  }
  if (transaction_.type === 'eip2930') {
    delete transaction_.maxFeePerGas
    delete transaction_.maxPriorityFeePerGas
  }
  return transaction_ as Transaction
}

export type DefineTransactionErrorType = DefineFormatterErrorType | ErrorType

export const defineTransaction = /*#__PURE__*/ defineFormatter(
  'transaction',
  formatTransaction,
)
