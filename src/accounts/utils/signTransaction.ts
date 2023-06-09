import type { Hex } from '../../types/misc.js'
import type {
  TransactionSerializable,
  TransactionSerialized,
  TransactionType,
} from '../../types/transaction.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import type { GetTransactionType } from '../../utils/transaction/getTransactionType.js'
import { serializeTransaction, type SerializeTransactionFn } from '../../utils/transaction/serializeTransaction.js'

import { sign } from './sign.js'

export type SignTransactionArgs<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
  TSerializer extends SerializeTransactionFn = SerializeTransactionFn,
> = {
  privateKey: Hex
  transaction: TTransactionSerializable
  serializer?: TSerializer
}
export type SignTransactionReturnType<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
  TTransactionType extends TransactionType = GetTransactionType<TTransactionSerializable>,
> = TransactionSerialized<TTransactionType>

export async function signTransaction<
  TTransactionSerializable extends TransactionSerializable,
>({
  privateKey,
  transaction,
  serializer = serializeTransaction,
}: SignTransactionArgs<TTransactionSerializable>): Promise<
  SignTransactionReturnType<TTransactionSerializable>
> {
  const signature = await sign({
    hash: keccak256(serializer(transaction)),
    privateKey,
  })
  return serializer(transaction, signature)
}
