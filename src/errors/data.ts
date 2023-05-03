import { BaseError } from './base.js'

export class SliceOffsetOutOfBoundsError extends BaseError {
  override name = 'SliceOffsetOutOfBoundsError'
  constructor({ offset, size }: { offset: number; size: number }) {
    super(
      `Slice starting at offset "${offset}" is out-of-bounds (size: ${size}).`,
    )
  }
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
