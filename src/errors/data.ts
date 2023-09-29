import { BaseError } from './base.js'

export type SliceOffsetOutOfBoundsErrorType = SliceOffsetOutOfBoundsError & {
  name: 'SliceOffsetOutOfBoundsError'
}
export class SliceOffsetOutOfBoundsError extends BaseError {
  override name = 'SliceOffsetOutOfBoundsError'
  constructor({
    offset,
    position,
    size,
  }: { offset: number; position: 'start' | 'end'; size: number }) {
    super(
      `Slice ${
        position === 'start' ? 'starting' : 'ending'
      } at offset "${offset}" is out-of-bounds (size: ${size}).`,
    )
  }
}

export type SizeExceedsPaddingSizeErrorType = SizeExceedsPaddingSizeError & {
  name: 'SizeExceedsPaddingSizeError'
}
export class SizeExceedsPaddingSizeError extends BaseError {
  override name = 'SizeExceedsPaddingSizeError'
  constructor({
    size,
    targetSize,
    type,
  }: {
    size: number
    targetSize: number
    type: 'hex' | 'bytes'
  }) {
    super(
      `${type.charAt(0).toUpperCase()}${type
        .slice(1)
        .toLowerCase()} size (${size}) exceeds padding size (${targetSize}).`,
    )
  }
}
