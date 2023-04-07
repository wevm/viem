import type { EstimateGasParameters } from '../../actions/index.js'
import type { BaseError } from '../../errors/index.js'
import { EstimateGasExecutionError } from '../../errors/index.js'
import type { Account, Chain } from '../../types/index.js'
import { containsNodeError, getNodeError } from './getNodeError.js'

export function getEstimateGasError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: Omit<EstimateGasParameters, 'account'> & {
    account?: Account
    chain?: Chain
    docsPath?: string
  },
) {
  let cause = err
  if (containsNodeError(err)) cause = getNodeError(err, args)
  return new EstimateGasExecutionError(cause, {
    docsPath,
    ...args,
  })
}
