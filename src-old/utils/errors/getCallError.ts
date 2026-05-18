import type { CallParameters } from '../../actions/public/call.js'
import type { BaseError } from '../../errors/base.js'
import {
  CallExecutionError,
  type CallExecutionErrorType,
} from '../../errors/contract.js'
import { UnknownNodeError } from '../../errors/node.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'

import {
  type GetNodeErrorParameters,
  type GetNodeErrorReturnType,
  getNodeError,
} from './getNodeError.js'

export type GetCallErrorReturnType<cause = ErrorType> = Omit<
  CallExecutionErrorType,
  'cause'
> & {
  cause: cause | GetNodeErrorReturnType
}

export function getCallError<err extends ErrorType<string>>(
  err: err,
  {
    docsPath,
    ...args
  }: CallParameters & {
    chain?: Chain | undefined
    docsPath?: string | undefined
  },
): GetCallErrorReturnType<err> {
  const cause = (() => {
    const cause = getNodeError(
      err as {} as BaseError,
      args as GetNodeErrorParameters,
    )
    if (cause instanceof UnknownNodeError) return err as {} as BaseError
    return cause
  })()
  return new CallExecutionError(cause, {
    docsPath,
    ...args,
  }) as GetCallErrorReturnType<err>
}
