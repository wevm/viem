import type { Account } from '../../accounts/types.js'
import type { EstimateGasParameters } from '../../actions/public/estimateGas.js'
import type { BaseError } from '../../errors/base.js'
import { EstimateGasExecutionError } from '../../errors/estimateGas.js'
import type { Chain } from '../../types/chain.js'

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
