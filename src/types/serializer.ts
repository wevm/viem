import type {
  TransactionSerializable,
  TransactionSerializableGeneric,
} from '../types/transaction.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import type { Formatter, Formatters } from './formatter.js'

export type Serializers<
  TFormatters extends Formatters | undefined = undefined,
> = {
  transaction?: SerializeTransactionFn<
    TFormatters extends Formatters
      ? TFormatters['transactionRequest'] extends Formatter
        ? TransactionSerializableGeneric &
            Parameters<TFormatters['transactionRequest']['format']>[0]
        : TransactionSerializable
      : TransactionSerializable
  >
}
