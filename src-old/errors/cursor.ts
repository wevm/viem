import { BaseError } from './base.js'

export type NegativeOffsetErrorType = NegativeOffsetError & {
  name: 'NegativeOffsetError'
}
export class NegativeOffsetError extends BaseError {
  constructor({ offset }: { offset: number }) {
    super(`Offset \`${offset}\` cannot be negative.`, {
      name: 'NegativeOffsetError',
    })
  }
}

export type PositionOutOfBoundsErrorType = PositionOutOfBoundsError & {
  name: 'PositionOutOfBoundsError'
}
export class PositionOutOfBoundsError extends BaseError {
  constructor({ length, position }: { length: number; position: number }) {
    super(
      `Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`,
      { name: 'PositionOutOfBoundsError' },
    )
  }
}

export type RecursiveReadLimitExceededErrorType =
  RecursiveReadLimitExceededError & {
    name: 'RecursiveReadLimitExceededError'
  }
export class RecursiveReadLimitExceededError extends BaseError {
  constructor({ count, limit }: { count: number; limit: number }) {
    super(
      `Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`,
      { name: 'RecursiveReadLimitExceededError' },
    )
  }
}
