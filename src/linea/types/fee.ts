import type { EstimateFeesPerGasReturnType } from '../../index.js'

export type LineaEstimateGasReturnType = {
  gasLimit: bigint
  baseFeePerGas: bigint
  priorityFeePerGas: bigint
}

export type LineaEstimateFeesPerGasReturnType = {
  gasLimit: bigint
} & EstimateFeesPerGasReturnType