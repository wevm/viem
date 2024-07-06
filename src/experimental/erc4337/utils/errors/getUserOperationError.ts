import type { BaseError } from '../../../../errors/base.js'
import type { ErrorType } from '../../../../errors/utils.js'
import { UnknownBundlerError } from '../../errors/bundler.js'
import {
  UserOperationExecutionError,
  type UserOperationExecutionErrorType,
} from '../../errors/userOperation.js'
import type { UserOperation } from '../../types/userOperation.js'
import {
  type GetBundlerErrorParameters,
  getBundlerError,
} from './getBundlerError.js'

type GetNodeErrorReturnType = ErrorType

export type GetUserOperationErrorParameters = UserOperation & {
  docsPath?: string | undefined
}

export type GetUserOperationErrorReturnType<cause = ErrorType> = Omit<
  UserOperationExecutionErrorType,
  'cause'
> & { cause: cause | GetNodeErrorReturnType }

export function getUserOperationError<err extends ErrorType<string>>(
  err: err,
  { docsPath, ...args }: GetUserOperationErrorParameters,
): GetUserOperationErrorReturnType<err> {
  const cause = (() => {
    const cause = getBundlerError(
      err as {} as BaseError,
      args as GetBundlerErrorParameters,
    )
    if (cause instanceof UnknownBundlerError) return err as {} as BaseError
    return cause
  })()
  return new UserOperationExecutionError(cause, {
    docsPath,
    ...args,
  }) as GetUserOperationErrorReturnType<err>
}
