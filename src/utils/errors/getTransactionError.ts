import type { Account } from '../../accounts/types.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import type { BaseError } from '../../errors/base.js'
import { UnknownNodeError } from '../../errors/node.js'
import { TransactionExecutionError } from '../../errors/transaction.js'
import type { Chain } from '../../types/chain.js'

import { type GetNodeErrorParameters, getNodeError } from './getNodeError.js'

export type GetTransactionErrorParameters = Omit<
  SendTransactionParameters,
  'account' | 'chain'
> & {
  account: Account
  chain?: Chain
  docsPath?: string
}

export function getTransactionError(
  err: BaseError,
  { docsPath, ...args }: GetTransactionErrorParameters,
) {
  let cause = getNodeError(err, args as GetNodeErrorParameters)
  if (cause instanceof UnknownNodeError) cause = err
  return new TransactionExecutionError(cause, {
    docsPath,
    ...args,
  })
}
