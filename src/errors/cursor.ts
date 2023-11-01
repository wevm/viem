import { BaseError } from './base.js'

export type NegativeOffsetErrorType = NegativeOffsetError & {
  name: 'NegativeOffsetError'
}
export class NegativeOffsetError extends BaseError {
  override name = 'NegativeOffsetError'
  constructor({ offset }: { offset: number }) {
    super(`Offset \`${offset}\` cannot be negative.`)
  }
}

export type PositionOutOfBoundsErrorType = PositionOutOfBoundsError & {
  name: 'PositionOutOfBoundsError'
}
export class PositionOutOfBoundsError extends BaseError {
  override name = 'PositionOutOfBoundsError'
  constructor({ length, position }: { length: number; position: number }) {
    super(
      `Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`,
    )
  }
}
