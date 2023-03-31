import type { CallParameters } from '../../actions/index.js'
import { BaseError, CallExecutionError } from '../../errors/index.js'
import type { Chain } from '../../types/index.js'
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
