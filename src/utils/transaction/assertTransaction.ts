import { versionedHashVersionKzg } from '../../constants/kzg.js'
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
  TransactionSerializableLegacy,
} from '../../types/transaction.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'
import { size } from '../data/size.js'
import { slice } from '../data/slice.js'
import { hexToNumber } from '../encoding/fromHex.js'

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
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } =
    transaction
  if (chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (gasPrice)
    throw new BaseError(
      '`gasPrice` is not a valid EIP-1559 Transaction attribute.',
    )
  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
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
  if (gasPrice && gasPrice > 2n ** 256n - 1n)
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
  const {
    chainId,
    maxPriorityFeePerGas,
    gasPrice,
    maxFeePerGas,
    to,
    accessList,
  } = transaction
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (typeof chainId !== 'undefined' && chainId <= 0)
    throw new InvalidChainIdError({ chainId })
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError(
      '`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.',
    )
  if (gasPrice && gasPrice > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice })
  if (accessList)
    throw new BaseError(
      '`accessList` is not a valid Legacy Transaction attribute.',
    )
}
