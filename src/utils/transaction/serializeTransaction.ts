import {
  InvalidLegacyVError,
  type InvalidLegacyVErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  ByteArray,
  Hex,
  Signature,
  SignatureLegacy,
} from '../../types/misc.js'
import type {
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableEIP4844,
  TransactionSerializableGeneric,
  TransactionSerializableLegacy,
  TransactionSerialized,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedEIP4844,
  TransactionSerializedLegacy,
  TransactionType,
} from '../../types/transaction.js'
import type { OneOf } from '../../types/utils.js'
import {
  type BlobsToCommitmentsErrorType,
  blobsToCommitments,
} from '../blob/blobsToCommitments.js'
import {
  blobsToProofs,
  type blobsToProofsErrorType,
} from '../blob/blobsToProofs.js'
import {
  type CommitmentsToVersionedHashesErrorType,
  commitmentsToVersionedHashes,
} from '../blob/commitmentsToVersionedHashes.js'
import {
  type ToBlobSidecarsErrorType,
  toBlobSidecars,
} from '../blob/toBlobSidecars.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import { trim } from '../data/trim.js'
import { type ToHexErrorType, bytesToHex, toHex } from '../encoding/toHex.js'
import { type ToRlpErrorType, toRlp } from '../encoding/toRlp.js'

import {
  type AssertTransactionEIP1559ErrorType,
  type AssertTransactionEIP2930ErrorType,
  type AssertTransactionEIP4844ErrorType,
  type AssertTransactionLegacyErrorType,
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionEIP4844,
  assertTransactionLegacy,
} from './assertTransaction.js'
import {
  type GetTransactionType,
  type GetTransationTypeErrorType,
  getTransactionType,
} from './getTransactionType.js'
import {
  type SerializeAccessListErrorType,
  serializeAccessList,
} from './serializeAccessList.js'

export type SerializedTransactionReturnType<
  transaction extends TransactionSerializable = TransactionSerializable,
  ///
  _transactionType extends TransactionType = GetTransactionType<transaction>,
> = TransactionSerialized<_transactionType>

export type SerializeTransactionFn<
  transaction extends TransactionSerializableGeneric = TransactionSerializable,
  ///
  _transactionType extends TransactionType = never,
> = typeof serializeTransaction<
  OneOf<TransactionSerializable | transaction>,
  _transactionType
>

export type SerializeTransactionErrorType =
  | GetTransationTypeErrorType
  | SerializeTransactionEIP1559ErrorType
  | SerializeTransactionEIP2930ErrorType
  | SerializeTransactionEIP4844ErrorType
  | SerializeTransactionLegacyErrorType
  | ErrorType

export function serializeTransaction<
  const transaction extends TransactionSerializable,
  ///
  _transactionType extends TransactionType = GetTransactionType<transaction>,
>(
  transaction: transaction,
  signature?: Signature,
): SerializedTransactionReturnType<transaction, _transactionType> {
  const type = getTransactionType(transaction) as GetTransactionType

  if (type === 'eip1559')
    return serializeTransactionEIP1559(
      transaction as TransactionSerializableEIP1559,
      signature,
    ) as SerializedTransactionReturnType<transaction>

  if (type === 'eip2930')
    return serializeTransactionEIP2930(
      transaction as TransactionSerializableEIP2930,
      signature,
    ) as SerializedTransactionReturnType<transaction>

  if (type === 'eip4844')
    return serializeTransactionEIP4844(
      transaction as TransactionSerializableEIP4844,
      signature,
    ) as SerializedTransactionReturnType<transaction>

  return serializeTransactionLegacy(
    transaction as TransactionSerializableLegacy,
    signature as SignatureLegacy,
  ) as SerializedTransactionReturnType<transaction>
}

type SerializeTransactionEIP4844ErrorType =
  | AssertTransactionEIP4844ErrorType
  | BlobsToCommitmentsErrorType
  | CommitmentsToVersionedHashesErrorType
  | blobsToProofsErrorType
  | ToBlobSidecarsErrorType
  | ConcatHexErrorType
  | InvalidLegacyVErrorType
  | ToHexErrorType
  | ToRlpErrorType
  | SerializeAccessListErrorType
  | ErrorType

function serializeTransactionEIP4844(
  transaction: TransactionSerializableEIP4844,
  signature?: Signature,
): TransactionSerializedEIP4844 {
  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerBlobGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    data,
  } = transaction

  assertTransactionEIP4844(transaction)

  let blobVersionedHashes = transaction.blobVersionedHashes
  let sidecars = transaction.sidecars
  // If `blobs` are passed, we will need to compute the KZG commitments & proofs.
  if (transaction.blobs) {
    const blobs = (
      typeof transaction.blobs[0] === 'string'
        ? transaction.blobs
        : (transaction.blobs as ByteArray[]).map((x) => bytesToHex(x))
    ) as Hex[]
    const kzg = transaction.kzg!
    const commitments = blobsToCommitments({
      blobs,
      kzg,
    })
    const proofs = blobsToProofs({ blobs, commitments, kzg })
    blobVersionedHashes = commitmentsToVersionedHashes({
      commitments,
    })

    if (sidecars !== false)
      sidecars = toBlobSidecars({ blobs, commitments, proofs })
  }

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : '0x',
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? toHex(maxFeePerGas) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x',
    serializedAccessList,
    maxFeePerBlobGas ? toHex(maxFeePerBlobGas) : '0x',
    blobVersionedHashes ?? [],
    ...toYParitySignatureArray(transaction, signature),
  ] as const

  const blobs: Hex[] = []
  const commitments: Hex[] = []
  const proofs: Hex[] = []
  if (sidecars)
    for (let i = 0; i < sidecars.length; i++) {
      const { blob, commitment, proof } = sidecars[i]
      blobs.push(blob)
      commitments.push(commitment)
      proofs.push(proof)
    }

  return concatHex([
    '0x03',
    sidecars
      ? // If sidecars are enabled, envelope turns into a "wrapper":
        toRlp([serializedTransaction, blobs, commitments, proofs])
      : // If sidecars are disabled, standard envelope is used:
        toRlp(serializedTransaction),
  ]) as TransactionSerializedEIP4844
}

type SerializeTransactionEIP1559ErrorType =
  | AssertTransactionEIP1559ErrorType
  | ConcatHexErrorType
  | InvalidLegacyVErrorType
  | ToHexErrorType
  | ToRlpErrorType
  | SerializeAccessListErrorType
  | ErrorType

function serializeTransactionEIP1559(
  transaction: TransactionSerializableEIP1559,
  signature?: Signature,
): TransactionSerializedEIP1559 {
  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    data,
  } = transaction

  assertTransactionEIP1559(transaction)

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : '0x',
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? toHex(maxFeePerGas) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x',
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature),
  ]

  return concatHex([
    '0x02',
    toRlp(serializedTransaction),
  ]) as TransactionSerializedEIP1559
}

type SerializeTransactionEIP2930ErrorType =
  | AssertTransactionEIP2930ErrorType
  | ConcatHexErrorType
  | InvalidLegacyVErrorType
  | ToHexErrorType
  | ToRlpErrorType
  | SerializeAccessListErrorType
  | ErrorType

function serializeTransactionEIP2930(
  transaction: TransactionSerializableEIP2930,
  signature?: Signature,
): TransactionSerializedEIP2930 {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } =
    transaction

  assertTransactionEIP2930(transaction)

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : '0x',
    gasPrice ? toHex(gasPrice) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x',
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature),
  ]

  return concatHex([
    '0x01',
    toRlp(serializedTransaction),
  ]) as TransactionSerializedEIP2930
}

type SerializeTransactionLegacyErrorType =
  | AssertTransactionLegacyErrorType
  | InvalidLegacyVErrorType
  | ToHexErrorType
  | ToRlpErrorType
  | ErrorType

function serializeTransactionLegacy(
  transaction: TransactionSerializableLegacy,
  signature?: SignatureLegacy,
): TransactionSerializedLegacy {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction

  assertTransactionLegacy(transaction)

  let serializedTransaction = [
    nonce ? toHex(nonce) : '0x',
    gasPrice ? toHex(gasPrice) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x',
  ]

  if (signature) {
    const v = (() => {
      // EIP-155 (inferred chainId)
      if (signature.v >= 35n) {
        const inferredChainId = (signature.v - 35n) / 2n
        if (inferredChainId > 0) return signature.v
        return 27n + (signature.v === 35n ? 0n : 1n)
      }

      // EIP-155 (explicit chainId)
      if (chainId > 0)
        return BigInt(chainId * 2) + BigInt(35n + signature.v - 27n)

      // Pre-EIP-155 (no chainId)
      const v = 27n + (signature.v === 27n ? 0n : 1n)
      if (signature.v !== v) throw new InvalidLegacyVError({ v: signature.v })
      return v
    })()

    serializedTransaction = [
      ...serializedTransaction,
      toHex(v),
      signature.r,
      signature.s,
    ]
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      toHex(chainId),
      '0x',
      '0x',
    ]
  }

  return toRlp(serializedTransaction) as TransactionSerializedLegacy
}

export function toYParitySignatureArray(
  transaction: TransactionSerializableGeneric,
  signature?: Signature,
) {
  const { r, s, v, yParity } = signature ?? transaction
  if (typeof r === 'undefined') return []
  if (typeof s === 'undefined') return []
  if (typeof v === 'undefined' && typeof yParity === 'undefined') return []

  const yParity_ = (() => {
    if (typeof yParity === 'number') return yParity ? toHex(1) : '0x'
    if (v === 0n) return '0x'
    if (v === 1n) return toHex(1)

    return v === 27n ? '0x' : toHex(1)
  })()
  return [yParity_, trim(r), trim(s)]
}
