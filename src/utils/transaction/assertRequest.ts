import { SendTransactionParameters } from '../../actions'
import {
  FeeCapTooHighError,
  InvalidAddressError,
  TipAboveFeeCapError,
} from '../../errors'
import { FeeConflictError } from '../../errors/transaction'
import { Chain } from '../../types'
import { isAddress } from '../address'

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
