import type { BaseError } from '../../errors/index.js'
import { TransactionExecutionError } from '../../errors/index.js'
import type { Account, Chain } from '../../types/index.js'
import type { SendTransactionParameters } from '../../wallet.js'
import { containsNodeError, getNodeError } from './getNodeError.js'

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
