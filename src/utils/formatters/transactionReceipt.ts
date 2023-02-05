import type {
  Chain,
  Formatter,
  Formatters,
  RpcTransactionReceipt,
  TransactionReceipt,
} from '../../types'
import { hexToNumber } from '../encoding'
import { defineFormatter, ExtractFormatter, Formatted } from './format'
import { formatLog } from './log'
import { transactionType } from './transaction'

export type TransactionReceiptFormatter<TChain extends Chain = Chain> =
  ExtractFormatter<
    TChain,
    'transactionReceipt',
    NonNullable<Formatters['transactionReceipt']>
  >

export type FormattedTransactionReceipt<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<TFormatter, TransactionReceipt>

const statuses = {
  '0x0': 'reverted',
  '0x1': 'success',
} as const

export function formatTransactionReceipt(
  transactionReceipt: Partial<RpcTransactionReceipt>,
) {
  return {
    ...transactionReceipt,
    blockNumber: transactionReceipt.blockNumber
      ? BigInt(transactionReceipt.blockNumber)
      : null,
    cumulativeGasUsed: transactionReceipt.cumulativeGasUsed
      ? BigInt(transactionReceipt.cumulativeGasUsed)
      : null,
    effectiveGasPrice: transactionReceipt.effectiveGasPrice
      ? BigInt(transactionReceipt.effectiveGasPrice)
      : null,
    gasUsed: transactionReceipt.gasUsed
      ? BigInt(transactionReceipt.gasUsed)
      : null,
    logs: transactionReceipt.logs
      ? transactionReceipt.logs.map(formatLog)
      : null,
    transactionIndex: transactionReceipt.transactionIndex
      ? hexToNumber(transactionReceipt.transactionIndex)
      : null,
    status: transactionReceipt.status
      ? statuses[transactionReceipt.status]
      : null,
    type: transactionReceipt.type
      ? transactionType[transactionReceipt.type]
      : null,
  } as TransactionReceipt
}

export const defineTransactionReceipt = defineFormatter({
  format: formatTransactionReceipt,
})
