import { isAddress } from '../address'
import {
  FeeCapTooHighError,
  InvalidAddressError,
  TipAboveFeeCapError,
} from '../../errors'
import type {
  TransactionRequestEIP1559,
  TransactionRequestEIP2930,
  TransactionRequestLegacy,
} from '../../types'
import { InvalidTransactionTypeError } from '../../errors/transaction'
import { PreEIP155NotSupportedError } from '../../errors/chain'

export function assertTransactionEIP1559(
  transaction: Omit<TransactionRequestEIP1559, 'from'> & { chainId: number },
) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } =
    transaction

  if (chainId <= 0) throw new PreEIP155NotSupportedError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (gasPrice) throw new InvalidTransactionTypeError({ type: 'eip1559' })

  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
}

export function assertTransactionEIP2930<
  TTransactionType extends TransactionRequestEIP2930,
>(transaction: Omit<TTransactionType, 'from'> & { chainId: number }) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } =
    transaction

  if (chainId <= 0) throw new PreEIP155NotSupportedError({ chainId })

  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })

  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new InvalidTransactionTypeError({ type: 'eip2930' })

  if (gasPrice && gasPrice > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice })
}

export function assertTransactionLegacy<
  TTransactionType extends TransactionRequestLegacy,
>(transaction: Omit<TTransactionType, 'from'> & { chainId?: number }) {
  const {
    chainId,
    maxPriorityFeePerGas,
    gasPrice,
    maxFeePerGas,
    to,
    accessList,
  } = transaction

  if (chainId !== undefined && chainId <= 0)
    throw new PreEIP155NotSupportedError({ chainId })

  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })

  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new InvalidTransactionTypeError({ type: 'legacy' })

  if (gasPrice && gasPrice > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice })

  if (accessList) throw new InvalidTransactionTypeError({ type: 'legacy' })
}
