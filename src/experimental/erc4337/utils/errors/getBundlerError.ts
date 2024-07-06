import type { BaseError } from '../../../../errors/base.js'
import type { ExactPartial } from '../../../../types/utils.js'
import {
  InitCodeFailedOrOutOfGasError,
  type InitCodeFailedOrOutOfGasErrorType,
  UnknownBundlerError,
  type UnknownBundlerErrorType,
} from '../../errors/bundler.js'
import type { UserOperation } from '../../types/userOperation.js'

export type GetBundlerErrorParameters = ExactPartial<UserOperation>

export type GetBundlerErrorReturnType =
  | InitCodeFailedOrOutOfGasErrorType
  | UnknownBundlerErrorType

export function getBundlerError(
  err: BaseError,
  args: GetBundlerErrorParameters,
): GetBundlerErrorReturnType {
  const message = (err.details || '').toLowerCase()

  if (InitCodeFailedOrOutOfGasError.bundlerMessage.test(message))
    return new InitCodeFailedOrOutOfGasError({
      cause: err,
      factory: args.factory,
      factoryData: args.factoryData,
    }) as any
  return new UnknownBundlerError({
    cause: err,
  }) as any
}
