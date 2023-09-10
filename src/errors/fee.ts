import { formatGwei } from '../utils/unit/formatGwei.js'
import { BaseError } from './base.js'

export class BaseFeeScalarError extends BaseError {
  override name = 'BaseFeeScalarError'
  constructor() {
    super('`baseFeeMultiplier` must be greater than 1.')
  }
}

export class Eip1559FeesNotSupportedError extends BaseError {
  override name = 'Eip1559FeesNotSupportedError'
  constructor() {
    super('Chain does not support EIP-1559 fees.')
  }
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
