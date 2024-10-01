import { formatGwei } from '../utils/unit/formatGwei.js'
import { BaseError } from './base.js'

export type BaseFeeScalarErrorType = BaseFeeScalarError & {
  name: 'BaseFeeScalarError'
}
export class BaseFeeScalarError extends BaseError {
  constructor() {
    super('`baseFeeMultiplier` must be greater than 1.', {
      name: 'BaseFeeScalarError',
    })
  }
}

export type Eip1559FeesNotSupportedErrorType = Eip1559FeesNotSupportedError & {
  name: 'Eip1559FeesNotSupportedError'
}
export class Eip1559FeesNotSupportedError extends BaseError {
  constructor() {
    super('Chain does not support EIP-1559 fees.', {
      name: 'Eip1559FeesNotSupportedError',
    })
  }
}

export type MaxFeePerGasTooLowErrorType = MaxFeePerGasTooLowError & {
  name: 'MaxFeePerGasTooLowError'
}
export class MaxFeePerGasTooLowError extends BaseError {
  constructor({ maxPriorityFeePerGas }: { maxPriorityFeePerGas: bigint }) {
    super(
      `\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(
        maxPriorityFeePerGas,
      )} gwei).`,
      { name: 'MaxFeePerGasTooLowError' },
    )
  }
}
