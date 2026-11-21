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

export type L2TimestampRequiredErrorType = L2TimestampRequiredError & {
  name: 'L2TimestampRequiredError'
}
export class L2TimestampRequiredError extends BaseError {
  constructor({ gameType }: { gameType: number }) {
    super(
      `Dispute game type ${gameType} anchors on L2 timestamps, so the L2 timestamp of the withdrawal is required.`,
      {
        metaMessages: [
          'Pass `l2Timestamp`, or a receipt whose logs include `blockTimestamp`.',
        ],
        name: 'L2TimestampRequiredError',
      },
    )
  }
}
