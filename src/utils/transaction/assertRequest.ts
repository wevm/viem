import type { SendTransactionParameters } from '../../actions/index.js'
import {
  FeeCapTooHighError,
  InvalidAddressError,
  TipAboveFeeCapError,
} from '../../errors/index.js'
import { FeeConflictError } from '../../errors/transaction.js'
import type { Chain } from '../../types/index.js'
import { isAddress } from '../address/index.js'

export function assertRequest(args: Partial<SendTransactionParameters<Chain>>) {
  const { account, gasPrice, maxFeePerGas, maxPriorityFeePerGas, to } = args
  if (account && !isAddress(account.address))
    throw new InvalidAddressError({ address: account.address })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (
    typeof gasPrice !== 'undefined' &&
    (typeof maxFeePerGas !== 'undefined' ||
      typeof maxPriorityFeePerGas !== 'undefined')
  )
    throw new FeeConflictError()

  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
}
