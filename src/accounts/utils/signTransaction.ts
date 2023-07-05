import type { Hex } from '../../types/misc.js'
import type {
  TransactionSerializable,
  TransactionSerialized,
} from '../../types/transaction.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import type { GetTransactionType } from '../../utils/transaction/getTransactionType.js'
import {
  type SerializeTransactionFn,
  serializeTransaction,
} from '../../utils/transaction/serializeTransaction.js'

import { sign } from './sign.js'

export type SignTransactionArgs<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
> = {
  privateKey: Hex
  transaction: TTransactionSerializable
  serializer?: SerializeTransactionFn<
    TransactionSerializable & TTransactionSerializable
  >
}
export type SignTransactionReturnType<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
> = TransactionSerialized<GetTransactionType<TTransactionSerializable>>

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
  return serializer(
    transaction,
    signature,
  ) as SignTransactionReturnType<TTransactionSerializable>
}
