import type { Hex } from '../../types/misc.js'
import type {
  TransactionSerializable,
  TransactionSerialized,
  TransactionType,
} from '../../types/transaction.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import type { GetTransactionType } from '../../utils/transaction/getTransactionType.js'
import { serializeTransaction } from '../../utils/transaction/serializeTransaction.js'

import { sign } from './sign.js'

export type SignTransactionArgs<
  TTransactionSerializable extends TransactionSerializable = TransactionSerializable,
> = {
  privateKey: Hex
  transaction: TTransactionSerializable
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
}: SignTransactionArgs<TTransactionSerializable>): Promise<
  SignTransactionReturnType<TTransactionSerializable>
> {
  const signature = await sign({
    hash: keccak256(serializeTransaction(transaction)),
    privateKey,
  })
  return serializeTransaction(transaction, signature)
}
