import { EstimateGasArgs } from '../../actions'
import { BaseError, EstimateGasExecutionError } from '../../errors'
import { Chain } from '../../types'
import { containsNodeError, getNodeError } from './getNodeError'

export function getEstimateGasError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: EstimateGasArgs & {
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
