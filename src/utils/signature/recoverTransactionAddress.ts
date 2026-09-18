import type { Address } from 'abitype'
import { BaseError, type BaseErrorType } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex, Signature } from '../../types/misc.js'
import type { TransactionSerialized } from '../../types/transaction.js'
import { slice } from '../data/slice.js'
import { hexToNumber } from '../encoding/fromHex.js'
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
  | BaseErrorType
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

  // EIP-8141: recover the sender's `SECP256K1` signature (no explicit `signer`)
  // over the canonical signature hash, which elides the `signature` bytes of
  // every entry with an empty `msg`.
  if ('frames' in transaction) {
    const signature = (() => {
      if (signature_) return signature_
      const entry = transaction.signatures?.find(
        (signature) =>
          signature.scheme === 1 &&
          signature.signer === null &&
          signature.msg === '0x' &&
          signature.signature !== '0x',
      )
      if (!entry)
        throw new BaseError(
          'EIP-8141 transactions require a `SECP256K1` signature by `sender` over the transaction hash (or an explicit `signature`) to recover an address.',
        )
      return {
        yParity: hexToNumber(slice(entry.signature, 0, 1)),
        r: slice(entry.signature, 1, 33),
        s: slice(entry.signature, 33, 65),
      }
    })()

    return await recoverAddress({
      hash: keccak256(
        serializeTransaction({
          ...transaction,
          signatures: transaction.signatures?.map((signature) =>
            signature.msg === '0x'
              ? { ...signature, signature: '0x' as const }
              : signature,
          ),
        }),
      ),
      signature,
    })
  }

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
