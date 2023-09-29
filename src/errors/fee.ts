import { formatGwei } from '../utils/unit/formatGwei.js'
import { BaseError } from './base.js'

export type BaseFeeScalarErrorType = BaseFeeScalarError & {
  name: 'BaseFeeScalarError'
}
export class BaseFeeScalarError extends BaseError {
  override name = 'BaseFeeScalarError'
  constructor() {
    super('`baseFeeMultiplier` must be greater than 1.')
  }
}

export type Eip1559FeesNotSupportedErrorType = Eip1559FeesNotSupportedError & {
  name: 'Eip1559FeesNotSupportedError'
}
export class Eip1559FeesNotSupportedError extends BaseError {
  override name = 'Eip1559FeesNotSupportedError'
  constructor() {
    super('Chain does not support EIP-1559 fees.')
  }
}

export type MaxFeePerGasTooLowErrorType = MaxFeePerGasTooLowError & {
  name: 'MaxFeePerGasTooLowError'
}
export class MaxFeePerGasTooLowError extends BaseError {
  override name = 'MaxFeePerGasTooLowError'
  constructor({ maxPriorityFeePerGas }: { maxPriorityFeePerGas: bigint }) {
    super(
      `\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(
        maxPriorityFeePerGas,
      )} gwei).`,
    )
  }
}
