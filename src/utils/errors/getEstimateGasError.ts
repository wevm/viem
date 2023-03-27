import type { EstimateGasParameters } from '../../actions/index.js'
import { BaseError, EstimateGasExecutionError } from '../../errors/index.js'
import type { Chain } from '../../types/index.js'
import { containsNodeError, getNodeError } from './getNodeError.js'

export function getEstimateGasError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: EstimateGasParameters & {
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
