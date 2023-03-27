import type {
  Hex,
  TransactionSerializable,
  TransactionSerialized,
  TransactionType,
} from '../../types'
import {
  GetTransactionType,
  keccak256,
  serializeTransaction,
} from '../../utils'
import { sign } from './sign'

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
