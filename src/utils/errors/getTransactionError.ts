import { BaseError, TransactionExecutionError } from '../../errors'
import type { Account } from '../../types'
import type { SendTransactionParameters } from '../../wallet'
import { containsNodeError, getNodeError } from './getNodeError'

export function getTransactionError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: Omit<SendTransactionParameters, 'account'> & {
    account: Account
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
