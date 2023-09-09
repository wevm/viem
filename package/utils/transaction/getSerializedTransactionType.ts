import { InvalidSerializedTransactionTypeError } from '../../errors/transaction.js'
import type {
  TransactionSerialized,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
} from '../../types/transaction.js'
import { sliceHex } from '../data/slice.js'
import { hexToNumber } from '../encoding/fromHex.js'

export type GetSerializedTransactionType<
  TTransactionSerialized extends TransactionSerialized = TransactionSerialized,
> = TTransactionSerialized extends TransactionSerializedEIP1559
  ? 'eip1559'
  : TTransactionSerialized extends TransactionSerializedEIP2930
  ? 'eip2930'
  : 'legacy'

export function getSerializedTransactionType<
  TSerialized extends TransactionSerialized,
>(
  serializedTransaction: TSerialized,
): GetSerializedTransactionType<TSerialized> {
  const serializedType = sliceHex(serializedTransaction, 0, 1)

  if (serializedType === '0x02')
    return 'eip1559' as GetSerializedTransactionType<TSerialized>

  if (serializedType === '0x01')
    return 'eip2930' as GetSerializedTransactionType<TSerialized>

  if (serializedType !== '0x' && hexToNumber(serializedType) >= 0xc0)
    return 'legacy' as GetSerializedTransactionType<TSerialized>

  throw new InvalidSerializedTransactionTypeError({ serializedType })
}
