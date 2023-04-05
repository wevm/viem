import type { CallParameters } from '../../actions'
import type { BaseError } from '../../errors'
import { CallExecutionError } from '../../errors'
import type { Chain } from '../../types'
import { containsNodeError, getNodeError } from './getNodeError'

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
