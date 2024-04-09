import { BaseError } from '../../errors/base.js'
import type { Hex } from '../../types/misc.js'

export type GameNotFoundErrorType = GameNotFoundError & {
  name: 'GameNotFoundError'
}
export class GameNotFoundError extends BaseError {
  override name = 'GameNotFoundError'
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
