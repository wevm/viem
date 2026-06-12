import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex, Signature } from '../../types/misc.js'
import type { TransactionSerialized } from '../../types/transaction.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'
import { parseTransaction } from '../transaction/parseTransaction.js'
import {
  type SerializeTransactionErrorType,
  serializeTransaction,
} from '../transaction/serializeTransaction.js'
import {
  type RecoverAddressErrorType,
  recoverAddress,
} from './recoverAddress.js'
import type { SerializeSignatureErrorType } from './serializeSignature.js'

export type RecoverTransactionAddressParameters = {
  serializedTransaction: TransactionSerialized
  signature?: Hex | ByteArray | Signature
}

export type RecoverTransactionAddressReturnType = Address

export type RecoverTransactionAddressErrorType =
  | SerializeTransactionErrorType
  | RecoverAddressErrorType
  | Keccak256ErrorType
  | SerializeSignatureErrorType
  | ErrorType

export async function recoverTransactionAddress(
  parameters: RecoverTransactionAddressParameters,
): Promise<RecoverTransactionAddressReturnType> {
  const { serializedTransaction, signature: signature_ } = parameters

  const transaction = parseTransaction(serializedTransaction)

  const signature = signature_ ?? {
    r: transaction.r!,
    s: transaction.s!,
    v: transaction.v!,
    yParity: transaction.yParity!,
  }

  const serialized = serializeTransaction({
    ...transaction,
    r: undefined,
    s: undefined,
    v: undefined,
    yParity: undefined,
    sidecars: undefined,
  })

  return await recoverAddress({
    hash: keccak256(serialized),
    signature,
  })
}
