import {
  InvalidSerializableTransactionError,
  type InvalidSerializableTransactionErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableEIP4844,
  TransactionSerializableGeneric,
  TransactionSerializableLegacy,
} from '../../types/transaction.js'
import type { IsNever } from '../../types/utils.js'

export type GetTransactionType<
  TTransactionSerializable extends
    TransactionSerializableGeneric = TransactionSerializableGeneric,
  result =
    | (TTransactionSerializable extends TransactionSerializableLegacy
        ? 'legacy'
        : never)
    | (TTransactionSerializable extends TransactionSerializableEIP1559
        ? 'eip1559'
        : never)
    | (TTransactionSerializable extends TransactionSerializableEIP2930
        ? 'eip2930'
        : never)
    | (TTransactionSerializable extends TransactionSerializableEIP4844
        ? 'eip4844'
        : never)
    | (TTransactionSerializable['type'] extends string
        ? TTransactionSerializable['type']
        : never),
> = IsNever<result> extends false ? result : string

export type GetTransationTypeErrorType =
  | InvalidSerializableTransactionErrorType
  | ErrorType

export function getTransactionType<
  const TTransactionSerializable extends TransactionSerializableGeneric,
>(
  transaction: TTransactionSerializable,
): GetTransactionType<TTransactionSerializable> {
  if (transaction.type)
    return transaction.type as GetTransactionType<TTransactionSerializable>

  if (typeof transaction.blobVersionedHashes !== 'undefined')
    return 'eip4844' as any

  if (
    typeof transaction.maxFeePerGas !== 'undefined' ||
    typeof transaction.maxPriorityFeePerGas !== 'undefined'
  ) {
    return 'eip1559' as any
  }

  if (typeof transaction.gasPrice !== 'undefined') {
    if (typeof transaction.accessList !== 'undefined') return 'eip2930' as any
    return 'legacy' as any
  }

  throw new InvalidSerializableTransactionError({ transaction })
}
