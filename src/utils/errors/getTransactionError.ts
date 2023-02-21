import { BaseError, TransactionExecutionError } from '../../errors'
import { SendTransactionArgs } from '../../wallet'
import { containsNodeError, getNodeError } from './getNodeError'

export function getTransactionError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: SendTransactionArgs & {
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
