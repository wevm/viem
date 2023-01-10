import type { ByteArray, Hex } from '../../types'
import { BaseError } from '../BaseError'

type PadOptions = {
  dir?: 'left' | 'right'
  size?: number
}

export function padHex(hex_: Hex, { dir, size = 32 }: PadOptions = {}) {
  let hex = hex_.replace('0x', '')
  if (hex.length > size * 2)
    throw new SizeExceedsPaddingSizeError({
      size: Math.ceil(hex.length / 2),
      targetSize: size,
      type: 'hex',
    })

  return ('0x' + hex[dir === 'right' ? 'padEnd' : 'padStart'](64, '0')) as Hex
}

export function padBytes(
  bytes: ByteArray,
  { dir, size = 32 }: PadOptions = {},
) {
  if (bytes.length > size)
    throw new SizeExceedsPaddingSizeError({
      size: bytes.length,
      targetSize: size,
      type: 'bytes',
    })
  const paddedBytes = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    const padEnd = dir === 'right'
    paddedBytes[padEnd ? i : size - i - 1] =
      bytes[padEnd ? i : bytes.length - i - 1]
  }
  return paddedBytes
}

export function pad(
  hexOrBytes: Hex | ByteArray,
  { dir, size = 32 }: PadOptions = {},
) {
  if (typeof hexOrBytes === 'string') return padHex(hexOrBytes, { dir, size })
  return padBytes(hexOrBytes, { dir, size })
}

///////////////////////////////////////////////////////////////
// Errors

class SizeExceedsPaddingSizeError extends BaseError {
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
