import { BaseError } from '../../errors/base.js'
import type { Hash } from '../../types/misc.js'

export type BaseFeeHigherThanValueErrorType = BaseFeeHigherThanValueError & {
  name: 'BaseFeeHigherThanValueError'
}
export class BaseFeeHigherThanValueError extends BaseError {
  constructor(baseCost: bigint, value: bigint) {
    super(
      [
        'The base cost of performing the priority operation is higher than the provided transaction value parameter.',
        '',
        `Base cost: ${baseCost}.`,
        `Provided value: ${value}.`,
      ].join('\n'),
      { name: 'BaseFeeHigherThanValueError' },
    )
  }
}

export type TxHashNotFoundInLogsErrorType = BaseFeeHigherThanValueError & {
  name: 'TxHashNotFoundInLogsError'
}
export class TxHashNotFoundInLogsError extends BaseError {
  constructor() {
    super('The transaction hash not found in event logs.', {
      name: 'TxHashNotFoundInLogsError',
    })
  }
}

export type WithdrawalLogNotFoundErrorType = WithdrawalLogNotFoundError & {
  name: 'WithdrawalLogNotFoundError'
}
export class WithdrawalLogNotFoundError extends BaseError {
  constructor({ hash }: { hash: Hash }) {
    super(
      [
        `Withdrawal log with hash ${hash} not found.`,
        '',
        'Either the withdrawal transaction is still processing or it did not finish successfully.',
      ].join('\n'),
      { name: 'WithdrawalLogNotFoundError' },
    )
  }
}

export type CannotClaimSuccessfulDepositErrorType =
  CannotClaimSuccessfulDepositError & {
    name: 'CannotClaimSuccessfulDepositError'
  }
export class CannotClaimSuccessfulDepositError extends BaseError {
  constructor({ hash }: { hash: Hash }) {
    super([`Cannot claim successful deposit: ${hash}.`].join('\n'), {
      name: 'CannotClaimSuccessfulDepositError',
    })
  }
}

export type LogProofNotFoundErrorType = LogProofNotFoundError & {
  name: 'LogProofNotFoundError'
}
export class LogProofNotFoundError extends BaseError {
  constructor({ hash, index }: { hash: Hash; index: number }) {
    super(
      [`Log proof not found for hash ${hash} and index ${index}.`].join('\n'),
      { name: 'LogProofNotFoundError' },
    )
  }
}

export type L2BridgeNotFoundErrorType = L2BridgeNotFoundError & {
  name: 'L2BridgeNotFoundError'
}
export class L2BridgeNotFoundError extends BaseError {
  constructor() {
    super(['L2 bridge address not found.'].join('\n'), {
      name: 'L2BridgeNotFoundError',
    })
  }
}
