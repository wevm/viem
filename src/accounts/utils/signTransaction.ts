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
  serializer extends
    SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<TransactionSerializable>,
  transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
> = {
  privateKey: Hex
  transaction: transaction
  serializer?: serializer | undefined
}

export type SignTransactionReturnType<
  serializer extends
    SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<TransactionSerializable>,
  transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
> = TransactionSerialized<GetTransactionType<transaction>>

export type SignTransactionErrorType =
  | Keccak256ErrorType
  | SignErrorType
  | ErrorType

export async function signTransaction<
  serializer extends
    SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<TransactionSerializable>,
  transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
>(
  parameters: SignTransactionParameters<serializer, transaction>,
): Promise<SignTransactionReturnType<serializer, transaction>> {
  const {
    privateKey,
    transaction,
    serializer = serializeTransaction,
  } = parameters

  const signableTransaction = (() => {
    // For EIP-4844 Transactions, we want to sign the transaction payload body (tx_payload_body) without the sidecars (ie. without the network wrapper).
    // See: https://github.com/ethereum/EIPs/blob/e00f4daa66bd56e2dbd5f1d36d09fd613811a48b/EIPS/eip-4844.md#networking
    if (transaction.type === 'eip4844')
      return {
        ...transaction,
        sidecars: false,
      }
    return transaction
  })()

  const signature = await sign({
    hash: keccak256(await serializer(signableTransaction)),
    privateKey,
  })
  return (await serializer(
    transaction,
    signature,
  )) as SignTransactionReturnType<serializer, transaction>
}
