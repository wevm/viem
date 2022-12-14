import type { Chain, Formatter } from '../../chains'
import type { RpcTransaction, Transaction } from '../../types'
import type { ExtractFormatter, FormatOptions, Formatted } from '../format'
import { format } from '../format'
import { hexToNumber } from '../number'

export type TransactionFormatter<TChain extends Chain = Chain> =
  ExtractFormatter<TChain, 'transaction'>

type FormatTransactionOptions = {
  formatter?: FormatOptions<RpcTransaction, Transaction>['formatter']
}

export type FormattedTransaction<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<RpcTransaction, Transaction, TFormatter>

export const transactionType = {
  '0x0': 'legacy',
  '0x1': 'eip2930',
  '0x2': 'eip1559',
} as const

export function formatTransaction<
  TFormatter extends Formatter | undefined = Formatter,
>(
  transaction_: RpcTransaction,
  { formatter }: FormatTransactionOptions = {},
): FormattedTransaction<TFormatter> {
  const transaction = format<RpcTransaction, Transaction, TFormatter>(
    transaction_,
    {
      replacer: {
        blockNumber: (transaction) =>
          transaction.blockNumber ? BigInt(transaction.blockNumber) : null,
        gas: (transaction) => BigInt(transaction.gas),
        maxFeePerGas: (transaction) =>
          transaction.maxFeePerGas
            ? BigInt(transaction.maxFeePerGas)
            : undefined,
        maxPriorityFeePerGas: (transaction) =>
          transaction.maxPriorityFeePerGas
            ? BigInt(transaction.maxPriorityFeePerGas)
            : undefined,
        nonce: (transaction) => hexToNumber(transaction.nonce),
        transactionIndex: (transaction) =>
          transaction.transactionIndex
            ? Number(transaction.transactionIndex)
            : null,
        type: (transaction) => transactionType[transaction.type],
        value: (transaction) => BigInt(transaction.value),
        v: (transaction) => BigInt(transaction.v),
      },
      formatter,
    },
  )

  if (transaction.type === 'legacy') {
    delete transaction['accessList']
    delete transaction['maxFeePerGas']
    delete transaction['maxPriorityFeePerGas']
  }

  if (transaction.type === 'eip2930') {
    delete transaction['maxFeePerGas']
    delete transaction['maxPriorityFeePerGas']
  }

  return transaction
}
