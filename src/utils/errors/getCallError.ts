import { CallArgs } from '../../actions'
import { BaseError, CallExecutionError } from '../../errors'
import { Chain } from '../../types'
import { containsNodeError, getNodeError } from './getNodeError'

export function getCallError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: CallArgs & {
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
