import type { EstimateGasParameters } from '../../actions'
import type { BaseError } from '../../errors'
import { EstimateGasExecutionError } from '../../errors'
import type { Account, Chain } from '../../types'
import { containsNodeError, getNodeError } from './getNodeError'

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
