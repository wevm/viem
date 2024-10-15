import type { CreateAccessListParameters } from '../../actions/public/createAccessList.js'
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

export type GetCreateAccessListErrorReturnType<cause = ErrorType> = Omit<
  CallExecutionErrorType,
  'cause'
> & {
  cause: cause | GetNodeErrorReturnType
}

export function getCreateAccessListError<err extends ErrorType<string>>(
  err: err,
  {
    docsPath,
    ...args
  }: CreateAccessListParameters & {
    chain?: Chain | undefined
    docsPath?: string | undefined
  },
): GetCreateAccessListErrorReturnType<err> {
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
  }) as GetCreateAccessListErrorReturnType<err>
}
