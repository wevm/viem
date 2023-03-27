import { BaseError } from './base.js'

export class SizeExceedsPaddingSizeError extends BaseError {
  name = 'SizeExceedsPaddingSizeError'
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
