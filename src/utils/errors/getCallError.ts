import type { CallParameters } from '../../actions/public/call.js'
import type { BaseError } from '../../errors/base.js'
import { CallExecutionError } from '../../errors/contract.js'
import type { Chain } from '../../types/chain.js'

import { containsNodeError, getNodeError } from './getNodeError.js'

export function getCallError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: CallParameters & {
    chain?: Chain
    docsPath?: string
  },
) {
  let cause = err
  if (containsNodeError(err)) cause = getNodeError(err, args)
  return new CallExecutionError(cause, {
    docsPath,
    ...args,
  })
}
