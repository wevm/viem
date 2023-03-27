import { BaseError, TransactionExecutionError } from '../../errors/index.js'
import type { SendTransactionParameters } from '../../wallet.js'
import { containsNodeError, getNodeError } from './getNodeError.js'

export function getTransactionError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: SendTransactionParameters & {
    docsPath?: string
  },
) {
  let cause = err
  if (containsNodeError(err)) cause = getNodeError(err, args)
  return new TransactionExecutionError(cause, {
    docsPath,
    ...args,
  })
}
