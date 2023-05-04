import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import { InvalidAddressError } from '../../errors/address.js'
import { FeeCapTooHighError, TipAboveFeeCapError } from '../../errors/node.js'
import { FeeConflictError } from '../../errors/transaction.js'
import type { Chain } from '../../types/chain.js'
import { isAddress } from '../address/isAddress.js'

export function assertRequest(args: Partial<SendTransactionParameters<Chain>>) {
  const {
    account: account_,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    to,
  } = args
  const account = account_ ? parseAccount(account_) : undefined
  if (account && !isAddress(account.address))
    throw new InvalidAddressError({ address: account.address })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (
    typeof gasPrice !== 'undefined' &&
    (typeof maxFeePerGas !== 'undefined' ||
      typeof maxPriorityFeePerGas !== 'undefined')
  )
    throw new FeeConflictError()

  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
}
