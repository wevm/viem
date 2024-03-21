import { BaseError } from '../../../errors/base.js'
import type { Hex } from '../../../types/misc.js'

export type DisputeGameNotFoundErrorType = DisputeGameNotFoundError & {
  name: 'DisputeGameNotFoundError'
}
export class DisputeGameNotFoundError extends BaseError {
  override name = 'DisputeGameNotFoundError'
  constructor() {
    super('Dispute game not found.')
  }
}

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
