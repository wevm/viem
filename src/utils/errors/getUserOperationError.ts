import type { BaseError } from '../../errors/base.js'
import { UnknownEntryPointError } from '../../errors/entryPoint.js'
import {
  UserOperationExecutionError,
  type UserOperationExecutionErrorType,
} from '../../errors/userOperation.js'
import type { ErrorType } from '../../errors/utils.js'
import type { UserOperation } from '../../types/userOperation.js'
import {
  type GetEntryPointErrorParameters,
  getEntryPointError,
} from './getEntryPointError.js'

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
    const cause = getEntryPointError(
      err as {} as BaseError,
      args as GetEntryPointErrorParameters,
    )
    if (cause instanceof UnknownEntryPointError) return err as {} as BaseError
    return cause
  })()
  return new UserOperationExecutionError(cause, {
    docsPath,
    ...args,
  }) as GetUserOperationErrorReturnType<err>
}
