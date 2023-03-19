import type { Account } from '../../accounts'
import { BaseError, TransactionExecutionError } from '../../errors'
import type { Chain } from '../../types'
import type { SendTransactionParameters } from '../../wallet'
import { containsNodeError, getNodeError } from './getNodeError'

export function getTransactionError(
  err: BaseError,
  {
    docsPath,
    ...args
  }: Omit<SendTransactionParameters, 'account' | 'chain'> & {
    account: Account
    chain?: Chain
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
