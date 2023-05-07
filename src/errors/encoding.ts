import type { ByteArray, Hex } from '../types/misc.js'

import { BaseError } from './base.js'

export class DataLengthTooLongError extends BaseError {
  override name = 'DataLengthTooLongError'
  constructor({ consumed, length }: { consumed: number; length: number }) {
    super(
      `Consumed bytes (${consumed}) is shorter than data length (${
        length - 1
      }).`,
    )
  }
}

export class DataLengthTooShortError extends BaseError {
  override name = 'DataLengthTooShortError'
  constructor({ length, dataLength }: { length: number; dataLength: number }) {
    super(
      `Data length (${dataLength - 1}) is shorter than prefix length (${
        length - 1
      }).`,
    )
  }
}

export class IntegerOutOfRangeError extends BaseError {
  override name = 'IntegerOutOfRangeError'
  constructor({
    max,
    min,
    signed,
    size,
    value,
  }: {
    max?: string
    min: string
    signed?: boolean
    size?: number
    value: string
  }) {
    super(
      `Number "${value}" is not in safe ${
        size ? `${size * 8}-bit ${signed ? 'signed' : 'unsigned'} ` : ''
      }integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`,
    )
  }
}

export class InvalidBytesBooleanError extends BaseError {
  override name = 'InvalidBytesBooleanError'
  constructor(bytes: ByteArray) {
    super(
      `Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`,
    )
  }
}

export class InvalidHexBooleanError extends BaseError {
  override name = 'InvalidHexBooleanError'
  constructor(hex: Hex) {
    super(
      `Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`,
    )
  }
}

export class InvalidHexValueError extends BaseError {
  override name = 'InvalidHexValueError'
  constructor(value: Hex) {
    super(
      `Hex value "${value}" is an odd length (${value.length}). It must be an even length.`,
    )
  }
}

export class OffsetOutOfBoundsError extends BaseError {
  override name = 'OffsetOutOfBoundsError'
  constructor({ nextOffset, offset }: { nextOffset: number; offset: number }) {
    super(
      `Next offset (${nextOffset}) is greater than previous offset + consumed bytes (${offset})`,
    )
  }
}

export class SizeOverflowError extends BaseError {
  override name = 'SizeOverflowError'
  constructor({ givenSize, maxSize }: { givenSize: number; maxSize: number }) {
    super(
      `Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`,
    )
  }
}
