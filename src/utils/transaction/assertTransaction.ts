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
import type {
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableEIP4844,
  TransactionSerializableEIP7702,
  TransactionSerializableEIP8141,
  TransactionSerializableLegacy,
} from '../../types/transaction.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'
import { size } from '../data/size.js'
import { slice } from '../data/slice.js'
import { hexToNumber } from '../encoding/fromHex.js'

export type AssertTransactionEIP8141ErrorType =
  | InvalidAddressErrorType
  | InvalidChainIdErrorType
  | BaseErrorType
  | ErrorType

const maxUint64 = 2n ** 64n - 1n
const maxInt64 = 2n ** 63n - 1n
const MAX_FRAMES = 64
const VERIFY = 1
const SENDER = 2
const APPROVE_SCOPE_MASK = 0x03
const ATOMIC_BATCH_FLAG = 0x04

export function assertTransactionEIP8141(
  transaction: TransactionSerializableEIP8141,
) {
  const { chainId, sender, frames, nonce, maxFeePerGas, maxPriorityFeePerGas } =
    transaction
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
  let totalFrameGas = 0n
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]
    if (frame.mode > 2)
      throw new BaseError(
        `Invalid frame mode ${frame.mode}. Must be 0 (DEFAULT), 1 (VERIFY), or 2 (SENDER).`,
      )
    if (frame.flags >= 8)
      throw new BaseError(
        `Invalid frame flags ${frame.flags}. Bits 3-7 are reserved and must be zero.`,
      )
    if (
      frame.mode === VERIFY &&
      (frame.flags & APPROVE_SCOPE_MASK) === 0
    )
      throw new BaseError(
        'VERIFY frames must permit a non-zero APPROVE scope (flags bits 0-1).',
      )
    if (frame.flags & ATOMIC_BATCH_FLAG) {
      if (frame.mode !== SENDER)
        throw new BaseError(
          'Atomic batch flag (bit 2) is only valid with SENDER mode.',
        )
      if (i + 1 >= frames.length)
        throw new BaseError(
          'Frame with atomic batch flag must not be the last frame.',
        )
      if (frames[i + 1].mode !== SENDER)
        throw new BaseError(
          'Frame following an atomic batch frame must be SENDER mode.',
        )
    }
    if (frame.target !== null && !isAddress(frame.target))
      throw new InvalidAddressError({ address: frame.target })
    if (frame.gasLimit > maxInt64)
      throw new BaseError('`frame.gasLimit` must be <= 2^63 - 1.')
    totalFrameGas += frame.gasLimit
    if (totalFrameGas > maxInt64)
      throw new BaseError('Total frame gas must be <= 2^63 - 1.')
  }
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
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
