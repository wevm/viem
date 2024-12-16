import { BaseError } from '../../errors/base.js'

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
