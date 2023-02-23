import { SendTransactionArgs } from '../../actions'
import {
  FeeCapTooHighError,
  InvalidAddressError,
  TipAboveFeeCapError,
} from '../../errors'
import { Chain } from '../../types'
import { isAddress } from '../address'

export function assertRequest(args: Partial<SendTransactionArgs<Chain>>) {
  const { from, maxFeePerGas, maxPriorityFeePerGas, to } = args
  if (from && !isAddress(from)) throw new InvalidAddressError({ address: from })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
}
