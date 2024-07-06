import type { Address } from 'abitype'
import { BaseError } from '../../../errors/base.js'
import type { Hex } from '../../../types/misc.js'

export type InitCodeFailedOrOutOfGasErrorType =
  InitCodeFailedOrOutOfGasError & {
    name: 'InitCodeFailedOrOutOfGasError'
  }
export class InitCodeFailedOrOutOfGasError extends BaseError {
  static bundlerMessage = /aa13/
  override name = 'InitCodeFailedOrOutOfGas'
  constructor({
    cause,
    factory = '0x',
    factoryData = '0x',
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
  }) {
    super('Failed to simulate deployment for Smart Account.', {
      cause,
      metaMessages: [`factory: ${factory}`, `factoryData: ${factoryData}`],
    })
  }
}

export type UnknownBundlerErrorType = UnknownBundlerError & {
  name: 'UnknownBundlerError'
}
export class UnknownBundlerError extends BaseError {
  override name = 'UnknownBundlerError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      `An error occurred while executing user operation: ${cause?.shortMessage}`,
      {
        cause,
      },
    )
  }
}
