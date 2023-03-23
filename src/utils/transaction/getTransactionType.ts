import { InvalidSerializableTransactionError } from '../../errors/transaction'
import type { AccessList, TransactionSerializable } from '../../types'

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

  if ('maxFeePerGas' in transaction || 'maxPriorityFeePerGas' in transaction)
    return 'eip1559' as GetTransactionType<TTransactionSerializable>

  if ('gasPrice' in transaction) {
    if ('accessList' in transaction)
      return 'eip2930' as GetTransactionType<TTransactionSerializable>
    return 'legacy' as GetTransactionType<TTransactionSerializable>
  }

  throw new InvalidSerializableTransactionError({ transaction })
}
