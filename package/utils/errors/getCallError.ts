import type { CallParameters } from '../../actions/public/call.js'
import type { BaseError } from '../../errors/base.js'
import { CallExecutionError } from '../../errors/contract.js'
import { UnknownNodeError } from '../../errors/node.js'
import type { Chain } from '../../types/chain.js'

import { type GetNodeErrorParameters, getNodeError } from './getNodeError.js'

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
  let cause = getNodeError(err, args as GetNodeErrorParameters)
  if (cause instanceof UnknownNodeError) cause = err
  return new CallExecutionError(cause, {
    docsPath,
    ...args,
  })
}
