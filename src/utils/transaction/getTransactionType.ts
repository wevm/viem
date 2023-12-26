import {
  InvalidSerializableTransactionError,
  type InvalidSerializableTransactionErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableGeneric,
  TransactionSerializableLegacy,
} from '../../types/transaction.js'

export type GetTransactionType<
  TTransactionSerializable extends
    TransactionSerializable = TransactionSerializable,
> =
  | (TTransactionSerializable extends TransactionSerializableLegacy
      ? 'legacy'
      : never)
  | (TTransactionSerializable extends TransactionSerializableEIP1559
      ? 'eip1559'
      : never)
  | (TTransactionSerializable extends TransactionSerializableEIP2930
      ? 'eip2930'
      : never)
  | (TTransactionSerializable extends TransactionSerializableGeneric
      ? TTransactionSerializable['type']
      : never)

export type GetTransationTypeErrorType =
  | InvalidSerializableTransactionErrorType
  | ErrorType

export function getTransactionType<
  TTransactionSerializable extends TransactionSerializable,
>(
  transaction: TTransactionSerializable,
): GetTransactionType<TTransactionSerializable> {
  if (transaction.type)
    return transaction.type as GetTransactionType<TTransactionSerializable>

  if (
    typeof transaction.maxFeePerGas !== 'undefined' ||
    typeof transaction.maxPriorityFeePerGas !== 'undefined'
  )
    return 'eip1559' as GetTransactionType<TTransactionSerializable>

  if (typeof transaction.gasPrice !== 'undefined') {
    if (typeof transaction.accessList !== 'undefined')
      return 'eip2930' as GetTransactionType<TTransactionSerializable>
    return 'legacy' as GetTransactionType<TTransactionSerializable>
  }

  throw new InvalidSerializableTransactionError({ transaction })
}
