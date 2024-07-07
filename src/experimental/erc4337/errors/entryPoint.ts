import type { Address } from 'abitype'
import { BaseError } from '../../../errors/base.js'
import type { Hex } from '../../../types/misc.js'

export type InitCodeFailedErrorType = InitCodeFailedError & {
  name: 'InitCodeFailedError'
}
export class InitCodeFailedError extends BaseError {
  static bundlerMessage = /aa13/
  override name = 'InitCodeFailed'
  constructor({
    cause,
    factory,
    factoryData,
    initCode,
  }: {
    cause?: BaseError | undefined
    factory?: Address | undefined
    factoryData?: Hex | undefined
    initCode?: Hex | undefined
  }) {
    super('Failed to simulate deployment for Smart Account.', {
      cause,
      metaMessages: [
        factory && `factory: ${factory}`,
        factoryData && `factoryData: ${factoryData}`,
        initCode && `initCode: ${initCode}`,
      ].filter(Boolean) as string[],
    })
  }
}

export type UnknownEntryPointErrorType = UnknownEntryPointError & {
  name: 'UnknownEntryPointError'
}
export class UnknownEntryPointError extends BaseError {
  override name = 'UnknownEntryPointError'

  constructor({ cause }: { cause?: BaseError | undefined }) {
    super(
      `An error occurred while executing user operation: ${cause?.shortMessage}`,
      {
        cause,
      },
    )
  }
}
