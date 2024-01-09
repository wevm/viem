import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import type {
  TransactionSerializable,
  TransactionSerialized,
} from '../../types/transaction.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../utils/hash/keccak256.js'
import type { GetTransactionType } from '../../utils/transaction/getTransactionType.js'
import {
  type SerializeTransactionFn,
  serializeTransaction,
} from '../../utils/transaction/serializeTransaction.js'

import { type SignErrorType, sign } from './sign.js'

export type SignTransactionParameters<
  TTransactionSerializable extends
    TransactionSerializable = TransactionSerializable,
> = {
  privateKey: Hex
  transaction: TTransactionSerializable
  serializer?: SerializeTransactionFn<
    TransactionSerializable & TTransactionSerializable
  >
}

export type SignTransactionReturnType<
  TTransactionSerializable extends
    TransactionSerializable = TransactionSerializable,
> = TransactionSerialized<GetTransactionType<TTransactionSerializable>>

export type SignTransactionErrorType =
  | Keccak256ErrorType
  | SignErrorType
  | ErrorType

export async function signTransaction<
  TTransactionSerializable extends TransactionSerializable,
>({
  privateKey,
  transaction,
  serializer = serializeTransaction,
}: SignTransactionParameters<TTransactionSerializable>): Promise<
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
