import type { Account } from '../../accounts/types.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import type { BaseError } from '../../errors/base.js'
import { TransactionExecutionError } from '../../errors/transaction.js'
import { UserRejectedRequestError, type ProviderRpcError } from '../../index.js'
import type { Chain } from '../../types/chain.js'

import {
  type GetNodeErrorParameters,
  containsNodeError,
  getNodeError,
} from './getNodeError.js'

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
  let cause = err

  /**
   * 
    When the user rejected the transaction after connecting the wallet through walletconnect,
    the error code of walletconnect is 5000, not 4001, so a unification process is needed.
    https://docs.walletconnect.com/2.0/specs/clients/sign/error-codes#rejected-caip-25

    See the code in the link below.
    https://github.com/wagmi-dev/references/blob/849d7a5d2c630c1b55f3414cea034303e84250f9/packages/connectors/src/walletConnect.ts#L159C32-L159C32
   */
  if (/user rejected/i.test((err as ProviderRpcError)?.message)) {
    return new UserRejectedRequestError(err as Error)
  }

  if (containsNodeError(err))
    cause = getNodeError(err, args as GetNodeErrorParameters)
  return new TransactionExecutionError(cause, {
    docsPath,
    ...args,
  })
}
