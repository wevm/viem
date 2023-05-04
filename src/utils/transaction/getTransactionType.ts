import { InvalidSerializableTransactionError } from '../../errors/transaction.js'
import type {
  AccessList,
  TransactionSerializable,
} from '../../types/transaction.js'

export type GetTransactionType<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
> =
  | (TTransactionSerializable['maxFeePerGas'] extends bigint
      ? 'eip1559'
      : never)
  | (TTransactionSerializable['maxPriorityFeePerGas'] extends bigint
      ? 'eip1559'
      : never)
  | (TTransactionSerializable['gasPrice'] extends bigint
      ? TTransactionSerializable['accessList'] extends AccessList
        ? 'eip2930'
        : 'legacy'
      : never)
  | (TTransactionSerializable['type'] extends string
      ? TTransactionSerializable['type']
      : never)

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
