import { InvalidAddressError } from '../../errors/address.js'
import { BaseError } from '../../errors/base.js'
import { InvalidChainIdError } from '../../errors/chain.js'
import { FeeCapTooHighError, TipAboveFeeCapError } from '../../errors/node.js'
import type {
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableLegacy,
} from '../../types/transaction.js'
import { isAddress } from '../address/isAddress.js'

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
