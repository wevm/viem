import { SendTransactionArgs } from '../../actions'
import { FeeCapTooHighError, TipAboveFeeCapError } from '../../errors'

export function assertRequest(args: SendTransactionArgs<any>) {
  const { maxFeePerGas, maxPriorityFeePerGas } = args
  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
}
