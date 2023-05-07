import type { Account } from '../../accounts/types.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import type { BaseError } from '../../errors/base.js'
import { TransactionExecutionError } from '../../errors/transaction.js'
import type { Chain } from '../../types/chain.js'

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
