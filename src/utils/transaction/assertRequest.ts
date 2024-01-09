import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { SendTransactionParameters } from '../../actions/wallet/sendTransaction.js'
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
import type { Account } from '../../index.js'
import type { Chain } from '../../types/chain.js'
import { isAddress } from '../address/isAddress.js'

export type AssertRequestParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
> = Partial<SendTransactionParameters<TChain, TAccount, TChainOverride>>

export type AssertRequestErrorType =
  | InvalidAddressErrorType
  | FeeConflictErrorType
  | FeeCapTooHighErrorType
  | ParseAccountErrorType
  | TipAboveFeeCapErrorType
  | ErrorType

export function assertRequest<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
>(args: AssertRequestParameters<TChain, TAccount, TChainOverride>) {
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
