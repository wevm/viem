import { BaseError, TransactionExecutionError } from '../../errors'
import { SendTransactionParameters } from '../../wallet'
import { containsNodeError, getNodeError } from './getNodeError'

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
