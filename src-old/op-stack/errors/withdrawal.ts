import { BaseError } from '../../errors/base.js'
import type { Hex } from '../../types/misc.js'

export type GameNotFoundErrorType = GameNotFoundError & {
  name: 'GameNotFoundError'
}
export class GameNotFoundError extends BaseError {
  constructor() {
    super('Dispute game not found.', { name: 'GameNotFoundError' })
  }
}

export type ReceiptContainsNoWithdrawalsErrorType =
  ReceiptContainsNoWithdrawalsError & {
    name: 'ReceiptContainsNoWithdrawalsError'
  }
export class ReceiptContainsNoWithdrawalsError extends BaseError {
  constructor({ hash }: { hash: Hex }) {
    super(
      `The provided transaction receipt with hash "${hash}" contains no withdrawals.`,
      { name: 'ReceiptContainsNoWithdrawalsError' },
    )
  }
}
