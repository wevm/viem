import type { FeeValues } from '../../../types/fee.js'

export function getBaseCostFromFeeData(feeData: FeeValues): bigint {
  const maxFeePerGas = feeData.maxFeePerGas!
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!

  return (maxFeePerGas - maxPriorityFeePerGas) / 2n
}
