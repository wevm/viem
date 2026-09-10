import { versionedHashVersionKzg } from '../../constants/kzg.js'
import { maxUint256 } from '../../constants/number.js'
import {
  InvalidAddressError,
  type InvalidAddressErrorType,
} from '../../errors/address.js'
import { BaseError, type BaseErrorType } from '../../errors/base.js'
import {
  EmptyBlobError,
  type EmptyBlobErrorType,
  InvalidVersionedHashSizeError,
  type InvalidVersionedHashSizeErrorType,
  InvalidVersionedHashVersionError,
  type InvalidVersionedHashVersionErrorType,
} from '../../errors/blob.js'
import {
  InvalidChainIdError,
  type InvalidChainIdErrorType,
} from '../../errors/chain.js'
import {
  FeeCapTooHighError,
  type FeeCapTooHighErrorType,
  TipAboveFeeCapError,
  type TipAboveFeeCapErrorType,
} from '../../errors/node.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import type {
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableEIP4844,
  TransactionSerializableEIP7702,
  TransactionSerializableEIP8141,
  TransactionSerializableLegacy,
} from '../../types/transaction.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'
import { isAddressEqual } from '../address/isAddressEqual.js'
import { size } from '../data/size.js'
import { slice } from '../data/slice.js'
import { hexToBigInt, hexToNumber } from '../encoding/fromHex.js'

export type AssertTransactionEIP8141ErrorType =
  | InvalidAddressErrorType
  | InvalidChainIdErrorType
  | InvalidVersionedHashSizeErrorType
  | InvalidVersionedHashVersionErrorType
  | FeeCapTooHighErrorType
  | TipAboveFeeCapErrorType
  | BaseErrorType
  | ErrorType

const maxUint64 = 2n ** 64n - 1n
const MAX_FRAMES = 64
const VERIFY = 1
const SENDER = 2
const APPROVE_SCOPE_MASK = 0x03
const APPROVE_EXECUTION = 0x02
const ATOMIC_BATCH_FLAG = 0x04
const ARBITRARY = 0
const SECP256K1 = 1
const P256 = 2
const EXPIRY_VERIFIER = '0x0000000000000000000000000000000000008141'
const EXPIRY_DATA_LENGTH = 8
// EIP-7825 transaction gas cap and the constants feeding the intrinsic cost.
const TX_MAX_GAS_LIMIT = 16_777_216n
const FRAME_TX_INTRINSIC_COST = 12_000n
const FRAME_TX_PER_FRAME_COST = 475n
const TX_VALUE_COST = 6_000n
const STANDARD_TOKEN_COST = 4n
const TOTAL_COST_FLOOR_PER_TOKEN = 16n
const FLOOR_TOKENS_PER_BYTE = 4n
const signatureGas = { [ARBITRARY]: 100n, [SECP256K1]: 2_800n, [P256]: 6_700n }

export function assertTransactionEIP8141(
  transaction: TransactionSerializableEIP8141,
) {
  const {
    chainId,
    sender,
    frames,
    signatures = [],
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    maxFeePerBlobGas,
    blobVersionedHashes = [],
  } = transaction
  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (!isAddress(sender)) throw new InvalidAddressError({ address: sender })
  if (sender === '0x0000000000000000000000000000000000000000')
    throw new BaseError('`sender` must not be the zero address.')
  if (typeof nonce === 'number' && BigInt(nonce) > maxUint64)
    throw new BaseError('`nonce` must be less than 2^64.')
  if (!frames || frames.length === 0)
    throw new BaseError('`frames` must contain at least one frame.')
  if (frames.length > MAX_FRAMES)
    throw new BaseError(
      `\`frames\` must not exceed MAX_FRAMES (${MAX_FRAMES}) per EIP-8141.`,
    )

  for (const hash of blobVersionedHashes) {
    const size_ = size(hash)
    if (size_ !== 32)
      throw new InvalidVersionedHashSizeError({ hash, size: size_ })
    const version = hexToNumber(slice(hash, 0, 1))
    if (version !== versionedHashVersionKzg)
      throw new InvalidVersionedHashVersionError({ hash, version })
  }
  if (blobVersionedHashes.length === 0 && maxFeePerBlobGas)
    throw new BaseError(
      '`maxFeePerBlobGas` must be 0 when no blob versioned hashes are included.',
    )

  let signatureVerificationCost = 0n
  let dataTokens = 0n
  let dataBytes = 0n
  for (const signature of signatures) {
    if (signature.scheme === SECP256K1 || signature.scheme === P256) {
      if (signature.signer !== null && !isAddress(signature.signer))
        throw new InvalidAddressError({ address: signature.signer })
    } else if (signature.scheme === ARBITRARY) {
      if (signature.signer !== null)
        throw new BaseError('`signer` must be empty for ARBITRARY signatures.')
    } else
      throw new BaseError(
        `Invalid signature scheme ${signature.scheme}. Must be 0 (ARBITRARY), 1 (SECP256K1), or 2 (P256).`,
      )
    const msgSize = size(signature.msg)
    if (msgSize !== 0 && msgSize !== 32)
      throw new BaseError('`msg` must be empty or a 32-byte digest.')
    if (msgSize === 32 && hexToBigInt(signature.msg) === 0n)
      throw new BaseError('`msg` must not be the zero digest.')
    // Empty signature bytes are permitted: they are elided when computing the
    // signature hash and filled in by `signTransaction`.
    const signatureSize = size(signature.signature)
    if (signatureSize !== 0) {
      if (signature.scheme === SECP256K1) {
        if (signatureSize !== 65)
          throw new BaseError(
            'SECP256K1 `signature` must be 65 bytes (`v || r || s`).',
          )
        if (hexToNumber(slice(signature.signature, 0, 1)) > 1)
          throw new BaseError('SECP256K1 `signature` `v` must be 0 or 1.')
      }
      if (signature.scheme === P256 && signatureSize !== 128)
        throw new BaseError(
          'P256 `signature` must be 128 bytes (`r || s || qx || qy`).',
        )
    }
    signatureVerificationCost += signatureGas[signature.scheme]
    for (const data of [
      signature.signer ?? '0x',
      signature.msg,
      signature.signature,
    ]) {
      dataTokens += tokensIn(data)
      dataBytes += BigInt(size(data))
    }
  }

  let totalFrameGas = 0n
  let totalExecutionGas = 0n
  let valueTransferCost = 0n
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]
    if (frame.mode > 2)
      throw new BaseError(
        `Invalid frame mode ${frame.mode}. Must be 0 (DEFAULT), 1 (VERIFY), or 2 (SENDER).`,
      )
    if (frame.flags >= 8)
      throw new BaseError(
        `Invalid frame flags ${frame.flags}. Bits 3 and above are reserved and must be zero.`,
      )
    if (frame.target !== null && !isAddress(frame.target))
      throw new InvalidAddressError({ address: frame.target })
    const frameValue = frame.value ?? 0n
    if (frameValue > maxUint256)
      throw new BaseError('`frame.value` must be less than 2^256.')
    if (frameValue < 0n)
      throw new BaseError('`frame.value` must not be negative.')
    if (frame.mode !== SENDER && frameValue !== 0n)
      throw new BaseError(
        '`frame.value` must be 0 for DEFAULT and VERIFY frames per EIP-8141.',
      )
    totalExecutionGas += frame.limits.execution
    totalFrameGas += frame.limits.execution + frame.limits.state
    if (totalFrameGas > maxUint64)
      throw new BaseError(
        'Total frame gas (execution + state) must be less than 2^64.',
      )
    if (
      frame.flags & APPROVE_EXECUTION &&
      frame.target !== null &&
      !isAddressEqual(frame.target, sender)
    )
      throw new BaseError(
        'Frames permitting APPROVE_EXECUTION (flags bit 1) must target `sender` or `null`.',
      )
    if (frame.flags & ATOMIC_BATCH_FLAG) {
      if (frame.mode === VERIFY)
        throw new BaseError(
          'Atomic batch flag (bit 2) is not valid with VERIFY mode.',
        )
      if (i + 1 >= frames.length)
        throw new BaseError(
          'Frame with atomic batch flag must not be the last frame.',
        )
      if (frames[i + 1].mode === VERIFY)
        throw new BaseError(
          'Frame following an atomic batch frame must not be VERIFY mode.',
        )
    }
    const inAtomicBatch =
      frame.flags & ATOMIC_BATCH_FLAG ||
      (i > 0 && frames[i - 1].flags & ATOMIC_BATCH_FLAG)
    if (inAtomicBatch && frame.flags & APPROVE_SCOPE_MASK)
      throw new BaseError(
        'Frames in an atomic batch must not permit an APPROVE scope (flags bits 0-1).',
      )
    if (
      frame.mode === VERIFY &&
      frame.target !== null &&
      isAddressEqual(frame.target, EXPIRY_VERIFIER) &&
      (frame.flags !== 0 ||
        frameValue !== 0n ||
        frame.limits.state !== 0n ||
        size(frame.data) !== EXPIRY_DATA_LENGTH)
    )
      throw new BaseError(
        'Expiry verifier frames must have zero flags, value and state gas limit, and 8 bytes of data.',
      )
    if (
      frameValue > 0n &&
      frame.target !== null &&
      !isAddressEqual(frame.target, sender)
    )
      valueTransferCost += TX_VALUE_COST
    dataTokens += tokensIn(frame.data)
    dataBytes += BigInt(size(frame.data))
  }

  // Intrinsic and execution gas must fit the EIP-7825 transaction cap.
  const baseCost =
    FRAME_TX_INTRINSIC_COST +
    BigInt(frames.length) * FRAME_TX_PER_FRAME_COST +
    signatureVerificationCost +
    valueTransferCost
  const intrinsicGas = baseCost + STANDARD_TOKEN_COST * dataTokens
  const calldataFloorGas =
    baseCost + TOTAL_COST_FLOOR_PER_TOKEN * FLOOR_TOKENS_PER_BYTE * dataBytes
  const maxGas =
    intrinsicGas + totalExecutionGas > calldataFloorGas
      ? intrinsicGas + totalExecutionGas
      : calldataFloorGas
  if (maxGas > TX_MAX_GAS_LIMIT)
    throw new BaseError(
      `Intrinsic and execution gas (${maxGas}) exceeds the EIP-7825 transaction gas cap (${TX_MAX_GAS_LIMIT}).`,
    )

  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
}

/** EIP-7623 weighted token count: zero bytes count 1, non-zero bytes count 4. */
function tokensIn(data: Hex) {
  let zeroBytes = 0
  for (let i = 2; i < data.length; i += 2)
    if (data[i] === '0' && data[i + 1] === '0') zeroBytes++
  return BigInt(zeroBytes + (size(data) - zeroBytes) * 4)
}

export type AssertTransactionEIP7702ErrorType =
  | AssertTransactionEIP1559ErrorType
  | InvalidAddressErrorType
  | InvalidChainIdErrorType
  | ErrorType

export function assertTransactionEIP7702(
  transaction: TransactionSerializableEIP7702,
) {
  const { authorizationList } = transaction
  if (authorizationList) {
    for (const authorization of authorizationList) {
      const { chainId } = authorization
      const address = authorization.address
      if (!isAddress(address)) throw new InvalidAddressError({ address })
      if (chainId < 0) throw new InvalidChainIdError({ chainId })
    }
  }
  assertTransactionEIP1559(transaction as {} as TransactionSerializableEIP1559)
}

export type AssertTransactionEIP4844ErrorType =
  | AssertTransactionEIP1559ErrorType
  | EmptyBlobErrorType
  | InvalidVersionedHashSizeErrorType
  | InvalidVersionedHashVersionErrorType
  | ErrorType

export function assertTransactionEIP4844(
  transaction: TransactionSerializableEIP4844,
) {
  const { blobVersionedHashes } = transaction
  if (blobVersionedHashes) {
    if (blobVersionedHashes.length === 0) throw new EmptyBlobError()
    for (const hash of blobVersionedHashes) {
      const size_ = size(hash)
      const version = hexToNumber(slice(hash, 0, 1))
      if (size_ !== 32)
        throw new InvalidVersionedHashSizeError({ hash, size: size_ })
      if (version !== versionedHashVersionKzg)
        throw new InvalidVersionedHashVersionError({
          hash,
          version,
        })
    }
  }
  assertTransactionEIP1559(transaction as {} as TransactionSerializableEIP1559)
}

export type AssertTransactionEIP1559ErrorType =
  | BaseErrorType
  | IsAddressErrorType
  | InvalidAddressErrorType
  | InvalidChainIdErrorType
  | FeeCapTooHighErrorType
  | TipAboveFeeCapErrorType
  | ErrorType

export function assertTransactionEIP1559(
  transaction: TransactionSerializableEIP1559,
) {
  const { chainId, maxPriorityFeePerGas, maxFeePerGas, to } = transaction
  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
}

export type AssertTransactionEIP2930ErrorType =
  | BaseErrorType
  | IsAddressErrorType
  | InvalidAddressErrorType
  | InvalidChainIdErrorType
  | FeeCapTooHighErrorType
  | ErrorType

export function assertTransactionEIP2930(
  transaction: TransactionSerializableEIP2930,
) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } =
    transaction
  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError(
      '`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.',
    )
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice })
}

export type AssertTransactionLegacyErrorType =
  | BaseErrorType
  | IsAddressErrorType
  | InvalidAddressErrorType
  | InvalidChainIdErrorType
  | FeeCapTooHighErrorType
  | ErrorType

export function assertTransactionLegacy(
  transaction: TransactionSerializableLegacy,
) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } =
    transaction
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (typeof chainId !== 'undefined' && chainId <= 0)
    throw new InvalidChainIdError({ chainId })
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError(
      '`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.',
    )
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice })
}
