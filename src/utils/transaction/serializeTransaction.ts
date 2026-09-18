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
  FrameSignature,
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableEIP4844,
  TransactionSerializableEIP7702,
  TransactionSerializableEIP8141,
  TransactionSerializableGeneric,
  TransactionSerializableLegacy,
  TransactionSerialized,
  TransactionSerializedEIP1559,
  TransactionSerializedEIP2930,
  TransactionSerializedEIP4844,
  TransactionSerializedEIP7702,
  TransactionSerializedEIP8141,
  TransactionSerializedLegacy,
  TransactionType,
} from '../../types/transaction.js'
import type { MaybePromise, OneOf } from '../../types/utils.js'
import { type GetAddressErrorType, getAddress } from '../address/getAddress.js'
import {
  type SerializeAuthorizationListErrorType,
  serializeAuthorizationList,
} from '../authorization/serializeAuthorizationList.js'
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
import { pad } from '../data/pad.js'
import { trim } from '../data/trim.js'
import {
  bytesToHex,
  type NumberToHexErrorType,
  numberToHex,
} from '../encoding/toHex.js'
import { type ToRlpErrorType, toRlp } from '../encoding/toRlp.js'
import {
  type AssertTransactionEIP1559ErrorType,
  type AssertTransactionEIP2930ErrorType,
  type AssertTransactionEIP4844ErrorType,
  type AssertTransactionEIP7702ErrorType,
  type AssertTransactionEIP8141ErrorType,
  type AssertTransactionLegacyErrorType,
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionEIP4844,
  assertTransactionEIP7702,
  assertTransactionEIP8141,
  assertTransactionLegacy,
} from './assertTransaction.js'
import {
  type GetTransactionType,
  type GetTransactionTypeErrorType,
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
> = (
  transaction: OneOf<TransactionSerializable | transaction>,
  signature?: Signature | undefined,
) => MaybePromise<
  SerializedTransactionReturnType<
    OneOf<TransactionSerializable | transaction>,
    _transactionType
  >
>

export type SerializeTransactionErrorType =
  | GetTransactionTypeErrorType
  | SerializeTransactionEIP1559ErrorType
  | SerializeTransactionEIP2930ErrorType
  | SerializeTransactionEIP4844ErrorType
  | SerializeTransactionEIP7702ErrorType
  | SerializeTransactionEIP8141ErrorType
  | SerializeTransactionLegacyErrorType
  | ErrorType

export function serializeTransaction<
  const transaction extends TransactionSerializable,
  ///
  _transactionType extends TransactionType = GetTransactionType<transaction>,
>(
  transaction: transaction,
  signature?: Signature | undefined,
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

  if (type === 'eip7702')
    return serializeTransactionEIP7702(
      transaction as TransactionSerializableEIP7702,
      signature,
    ) as SerializedTransactionReturnType<transaction>

  if (type === 'eip8141')
    return serializeTransactionEIP8141(
      transaction as TransactionSerializableEIP8141,
      signature,
    ) as SerializedTransactionReturnType<transaction>

  return serializeTransactionLegacy(
    transaction as TransactionSerializableLegacy,
    signature as SignatureLegacy,
  ) as SerializedTransactionReturnType<transaction>
}

type SerializeTransactionEIP8141ErrorType =
  | AssertTransactionEIP8141ErrorType
  | ConcatHexErrorType
  | GetAddressErrorType
  | NumberToHexErrorType
  | ToRlpErrorType
  | ErrorType

function serializeTransactionEIP8141(
  transaction: TransactionSerializableEIP8141,
  signature?: Signature | undefined,
): TransactionSerializedEIP8141 {
  const {
    chainId,
    nonce,
    sender,
    frames,
    maxPriorityFeePerGas,
    maxFeePerGas,
    maxFeePerBlobGas,
    blobVersionedHashes,
  } = transaction

  const signatures = signature
    ? attachSignatureEIP8141(transaction.signatures, signature)
    : (transaction.signatures ?? [])

  assertTransactionEIP8141({ ...transaction, signatures })

  const serializedFrames = frames.map((frame) => [
    frame.mode ? numberToHex(frame.mode) : '0x',
    frame.flags ? numberToHex(frame.flags) : '0x',
    frame.target ? getAddress(frame.target) : '0x',
    [
      frame.limits.execution ? numberToHex(frame.limits.execution) : '0x',
      frame.limits.state ? numberToHex(frame.limits.state) : '0x',
    ],
    frame.value ? numberToHex(frame.value) : '0x',
    frame.data ?? '0x',
  ])

  const serializedSignatures = signatures.map((signature) => [
    signature.scheme ? numberToHex(signature.scheme) : '0x',
    signature.signer ? getAddress(signature.signer) : '0x',
    signature.msg ?? '0x',
    signature.signature ?? '0x',
  ])

  return concatHex([
    '0x06',
    toRlp([
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : '0x',
      sender,
      serializedFrames,
      serializedSignatures,
      [
        maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : '0x',
        maxFeePerGas ? numberToHex(maxFeePerGas) : '0x',
        maxFeePerBlobGas ? numberToHex(maxFeePerBlobGas) : '0x',
      ],
      blobVersionedHashes ?? [],
    ]),
  ]) as TransactionSerializedEIP8141
}

/**
 * Returns the EIP-8141 `signatures` list with the sender's unsigned
 * `SECP256K1` slot (no explicit `signer`, empty `msg`, empty `signature`)
 * filled in with `signature`, encoded as `v (1 byte) || r (32 bytes) || s (32 bytes)`.
 * A slot is appended when none exists, so an unsigned transaction and its
 * signed counterpart share the same canonical signature hash.
 */
export function attachSignatureEIP8141(
  signatures: readonly FrameSignature[] | undefined,
  signature?: Signature | undefined,
): FrameSignature[] {
  const signatures_ = [...(signatures ?? [])]
  let index = signatures_.findIndex(
    (signature) =>
      signature.scheme === 1 &&
      signature.signer === null &&
      signature.msg === '0x' &&
      signature.signature === '0x',
  )
  if (index === -1) {
    signatures_.push({ scheme: 1, signer: null, msg: '0x', signature: '0x' })
    index = signatures_.length - 1
  }
  if (!signature) return signatures_

  const yParity = (() => {
    if (signature.yParity === 0 || signature.yParity === 1)
      return signature.yParity
    if (signature.v === 0n || signature.v === 27n) return 0
    if (signature.v === 1n || signature.v === 28n) return 1
    throw new InvalidLegacyVError({ v: signature.v as bigint })
  })()
  signatures_[index] = {
    ...signatures_[index],
    signature: concatHex([
      numberToHex(yParity, { size: 1 }),
      pad(signature.r, { size: 32 }),
      pad(signature.s, { size: 32 }),
    ]),
  }
  return signatures_
}

type SerializeTransactionEIP7702ErrorType =
  | AssertTransactionEIP7702ErrorType
  | SerializeAuthorizationListErrorType
  | ConcatHexErrorType
  | InvalidLegacyVErrorType
  | NumberToHexErrorType
  | ToRlpErrorType
  | SerializeAccessListErrorType
  | ErrorType

function serializeTransactionEIP7702(
  transaction: TransactionSerializableEIP7702,
  signature?: Signature | undefined,
): TransactionSerializedEIP7702 {
  const {
    authorizationList,
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

  assertTransactionEIP7702(transaction)

  const serializedAccessList = serializeAccessList(accessList)
  const serializedAuthorizationList =
    serializeAuthorizationList(authorizationList)

  return concatHex([
    '0x04',
    toRlp([
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : '0x',
      maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : '0x',
      maxFeePerGas ? numberToHex(maxFeePerGas) : '0x',
      gas ? numberToHex(gas) : '0x',
      to ?? '0x',
      value ? numberToHex(value) : '0x',
      data ?? '0x',
      serializedAccessList,
      serializedAuthorizationList,
      ...toYParitySignatureArray(transaction, signature),
    ]),
  ]) as TransactionSerializedEIP7702
}

type SerializeTransactionEIP4844ErrorType =
  | AssertTransactionEIP4844ErrorType
  | BlobsToCommitmentsErrorType
  | CommitmentsToVersionedHashesErrorType
  | blobsToProofsErrorType
  | ToBlobSidecarsErrorType
  | ConcatHexErrorType
  | InvalidLegacyVErrorType
  | NumberToHexErrorType
  | ToRlpErrorType
  | SerializeAccessListErrorType
  | ErrorType

function serializeTransactionEIP4844(
  transaction: TransactionSerializableEIP4844,
  signature?: Signature | undefined,
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
  if (
    transaction.blobs &&
    (typeof blobVersionedHashes === 'undefined' ||
      typeof sidecars === 'undefined')
  ) {
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

    if (typeof blobVersionedHashes === 'undefined')
      blobVersionedHashes = commitmentsToVersionedHashes({
        commitments,
      })
    if (typeof sidecars === 'undefined') {
      const proofs = blobsToProofs({ blobs, commitments, kzg })
      sidecars = toBlobSidecars({ blobs, commitments, proofs })
    }
  }

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : '0x',
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? numberToHex(maxFeePerGas) : '0x',
    gas ? numberToHex(gas) : '0x',
    to ?? '0x',
    value ? numberToHex(value) : '0x',
    data ?? '0x',
    serializedAccessList,
    maxFeePerBlobGas ? numberToHex(maxFeePerBlobGas) : '0x',
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
  | NumberToHexErrorType
  | ToRlpErrorType
  | SerializeAccessListErrorType
  | ErrorType

function serializeTransactionEIP1559(
  transaction: TransactionSerializableEIP1559,
  signature?: Signature | undefined,
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
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : '0x',
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? numberToHex(maxFeePerGas) : '0x',
    gas ? numberToHex(gas) : '0x',
    to ?? '0x',
    value ? numberToHex(value) : '0x',
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
  | NumberToHexErrorType
  | ToRlpErrorType
  | SerializeAccessListErrorType
  | ErrorType

function serializeTransactionEIP2930(
  transaction: TransactionSerializableEIP2930,
  signature?: Signature | undefined,
): TransactionSerializedEIP2930 {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } =
    transaction

  assertTransactionEIP2930(transaction)

  const serializedAccessList = serializeAccessList(accessList)

  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : '0x',
    gasPrice ? numberToHex(gasPrice) : '0x',
    gas ? numberToHex(gas) : '0x',
    to ?? '0x',
    value ? numberToHex(value) : '0x',
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
  | NumberToHexErrorType
  | ToRlpErrorType
  | ErrorType

function serializeTransactionLegacy(
  transaction: TransactionSerializableLegacy,
  signature?: SignatureLegacy | undefined,
): TransactionSerializedLegacy {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction

  assertTransactionLegacy(transaction)

  let serializedTransaction = [
    nonce ? numberToHex(nonce) : '0x',
    gasPrice ? numberToHex(gasPrice) : '0x',
    gas ? numberToHex(gas) : '0x',
    to ?? '0x',
    value ? numberToHex(value) : '0x',
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

    const r = trim(signature.r)
    const s = trim(signature.s)

    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(v),
      r === '0x00' ? '0x' : r,
      s === '0x00' ? '0x' : s,
    ]
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(chainId),
      '0x',
      '0x',
    ]
  }

  return toRlp(serializedTransaction) as TransactionSerializedLegacy
}

export function toYParitySignatureArray(
  transaction: TransactionSerializableGeneric,
  signature_?: Signature | undefined,
) {
  const signature = signature_ ?? transaction
  const { v, yParity } = signature

  if (typeof signature.r === 'undefined') return []
  if (typeof signature.s === 'undefined') return []
  if (typeof v === 'undefined' && typeof yParity === 'undefined') return []

  const r = trim(signature.r)
  const s = trim(signature.s)

  const yParity_ = (() => {
    if (typeof yParity === 'number') return yParity ? numberToHex(1) : '0x'
    if (v === 0n) return '0x'
    if (v === 1n) return numberToHex(1)

    return v === 27n ? '0x' : numberToHex(1)
  })()

  return [yParity_, r === '0x00' ? '0x' : r, s === '0x00' ? '0x' : s]
}
