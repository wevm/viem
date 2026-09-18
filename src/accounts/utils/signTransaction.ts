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
  attachSignatureEIP8141,
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
  const { privateKey, serializer = serializeTransaction } = parameters

  const transaction = (() => {
    // For EIP-8141 Transactions, the signature is placed in the outer `signatures` list,
    // so reserve its slot up-front: the canonical signature hash commits to the slot's metadata.
    if ('frames' in parameters.transaction)
      return {
        ...parameters.transaction,
        signatures: attachSignatureEIP8141(parameters.transaction.signatures),
      } as typeof parameters.transaction
    return parameters.transaction
  })()

  const signableTransaction = (() => {
    // For EIP-4844 Transactions, we want to sign the transaction payload body (tx_payload_body) without the sidecars (ie. without the network wrapper).
    // See: https://github.com/ethereum/EIPs/blob/e00f4daa66bd56e2dbd5f1d36d09fd613811a48b/EIPS/eip-4844.md#networking
    if (transaction.type === 'eip4844')
      return {
        ...transaction,
        sidecars: false,
      }
    // For EIP-8141 Transactions, the signature hash elides the `signature` bytes of every
    // entry signed over the canonical hash (empty `msg`).
    // See: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-8141.md#signature-hash
    if ('frames' in transaction)
      return {
        ...transaction,
        signatures: transaction.signatures?.map((signature) =>
          signature.msg === '0x'
            ? { ...signature, signature: '0x' as const }
            : signature,
        ),
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
