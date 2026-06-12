import type { Account } from '../../accounts/types.js'
import type { EstimateGasParameters } from '../../actions/public/estimateGas.js'
import type { BaseError } from '../../errors/base.js'
import {
  EstimateGasExecutionError,
  type EstimateGasExecutionErrorType,
} from '../../errors/estimateGas.js'
import { UnknownNodeError } from '../../errors/node.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'

import {
  type GetNodeErrorParameters,
  type GetNodeErrorReturnType,
  getNodeError,
} from './getNodeError.js'

export type GetEstimateGasErrorReturnType<cause = ErrorType> = Omit<
  EstimateGasExecutionErrorType,
  'cause'
> & { cause: cause | GetNodeErrorReturnType }

export function getEstimateGasError<err extends ErrorType<string>>(
  err: err,
  {
    docsPath,
    ...args
  }: Omit<EstimateGasParameters, 'account'> & {
    account?: Account | undefined
    chain?: Chain | undefined
    docsPath?: string | undefined
  },
): GetEstimateGasErrorReturnType<err> {
  const cause = (() => {
    const cause = getNodeError(
      err as {} as BaseError,
      args as GetNodeErrorParameters,
    )
    if (cause instanceof UnknownNodeError) return err as {} as BaseError
    return cause
  })()
  return new EstimateGasExecutionError(cause, {
    docsPath,
    ...args,
  }) as GetEstimateGasErrorReturnType<err>
}
