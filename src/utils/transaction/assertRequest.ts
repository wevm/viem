import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
import { maxUint256 } from '../../constants/number.js'
import {
  InvalidAddressError,
  type InvalidAddressErrorType,
} from '../../errors/address.js'
import {
  FeeCapTooHighError,
  type FeeCapTooHighErrorType,
  TipAboveFeeCapError,
  type TipAboveFeeCapErrorType,
} from '../../errors/node.js'
import {
  FeeConflictError,
  type FeeConflictErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { ExactPartial } from '../../types/utils.js'
import { isAddress } from '../address/isAddress.js'

export type AssertRequestParameters = ExactPartial<
  SendTransactionParameters<Chain>
>

export type AssertRequestErrorType =
  | InvalidAddressErrorType
  | FeeConflictErrorType
  | FeeCapTooHighErrorType
  | ParseAccountErrorType
  | TipAboveFeeCapErrorType
  | ErrorType

export function assertRequest(args: AssertRequestParameters) {
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

  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas })
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas })
}
