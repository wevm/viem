import { BaseError } from '../../../errors/base.js'
import type { Hex } from '../../../types/misc.js'

export type ReceiptContainsNoWithdrawalsErrorType =
  ReceiptContainsNoWithdrawalsError & {
    name: 'ReceiptContainsNoWithdrawalsError'
  }
export class ReceiptContainsNoWithdrawalsError extends BaseError {
  override name = 'ReceiptContainsNoWithdrawalsError'
  constructor({ hash }: { hash: Hex }) {
    super(
      `The provided transaction receipt with hash "${hash}" contains no withdrawals.`,
    )
  }
}
