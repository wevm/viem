import type { ByteArray, Hex } from '../types/misc.js'

import { BaseError } from './base.js'

export type IntegerOutOfRangeErrorType = IntegerOutOfRangeError & {
  name: 'IntegerOutOfRangeError'
}
export class IntegerOutOfRangeError extends BaseError {
  constructor({
    max,
    min,
    signed,
    size,
    value,
  }: {
    max?: string | undefined
    min: string
    signed?: boolean | undefined
    size?: number | undefined
    value: string
  }) {
    super(
      `Number "${value}" is not in safe ${
        size ? `${size * 8}-bit ${signed ? 'signed' : 'unsigned'} ` : ''
      }integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`,
      { name: 'IntegerOutOfRangeError' },
    )
  }
}

export type InvalidBytesBooleanErrorType = InvalidBytesBooleanError & {
  name: 'InvalidBytesBooleanError'
}
export class InvalidBytesBooleanError extends BaseError {
  constructor(bytes: ByteArray) {
    super(
      `Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`,
      {
        name: 'InvalidBytesBooleanError',
      },
    )
  }
}

export type InvalidHexBooleanErrorType = InvalidHexBooleanError & {
  name: 'InvalidHexBooleanError'
}
export class InvalidHexBooleanError extends BaseError {
  constructor(hex: Hex) {
    super(
      `Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`,
      { name: 'InvalidHexBooleanError' },
    )
  }
}

export type InvalidHexValueErrorType = InvalidHexValueError & {
  name: 'InvalidHexValueError'
}
export class InvalidHexValueError extends BaseError {
  constructor(value: Hex) {
    super(
      `Hex value "${value}" is an odd length (${value.length}). It must be an even length.`,
      { name: 'InvalidHexValueError' },
    )
  }
}

export type RlpDepthLimitExceededErrorType = RlpDepthLimitExceededError & {
  name: 'RlpDepthLimitExceededError'
}
export class RlpDepthLimitExceededError extends BaseError {
  constructor({ limit }: { limit: number }) {
    super(`RLP depth limit of \`${limit}\` exceeded.`, {
      name: 'RlpDepthLimitExceededError',
    })
  }
}

export type RlpListBoundaryExceededErrorType = RlpListBoundaryExceededError & {
  name: 'RlpListBoundaryExceededError'
}
export class RlpListBoundaryExceededError extends BaseError {
  constructor({ consumed, declared }: { consumed: number; declared: number }) {
    super(
      `RLP list items consumed \`${consumed}\` bytes but the list declared a length of \`${declared}\`.`,
      { name: 'RlpListBoundaryExceededError' },
    )
  }
}

export type RlpTrailingBytesErrorType = RlpTrailingBytesError & {
  name: 'RlpTrailingBytesError'
}
export class RlpTrailingBytesError extends BaseError {
  constructor({ count }: { count: number }) {
    super(
      `RLP payload encodes a single item, but \`${count}\` trailing ${
        count === 1 ? 'byte remains' : 'bytes remain'
      }.`,
      { name: 'RlpTrailingBytesError' },
    )
  }
}

export type SizeOverflowErrorType = SizeOverflowError & {
  name: 'SizeOverflowError'
}
export class SizeOverflowError extends BaseError {
  constructor({ givenSize, maxSize }: { givenSize: number; maxSize: number }) {
    super(
      `Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`,
      { name: 'SizeOverflowError' },
    )
  }
}
