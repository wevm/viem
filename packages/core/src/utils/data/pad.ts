import type { ByteArray, Hex } from '../../types'

type PadOptions = {
  dir?: 'left' | 'right'
  size?: number
}

export function padHex(hex_: Hex, { dir, size = 32 }: PadOptions = {}) {
  let hex = hex_.replace('0x', '')
  if (hex.length > size * 2)
    throw new Error(
      `Hex size (${Math.ceil(
        hex.length / 2,
      )} bytes) exceeds padding size (${size} bytes).`,
    )
  return '0x' + hex[dir === 'right' ? 'padEnd' : 'padStart'](64, '0')
}

export function padBytes(
  bytes: ByteArray,
  { dir, size = 32 }: PadOptions = {},
) {
  if (bytes.length > size)
    throw new Error(
      `Bytes size (${bytes.length}) exceeds padding size (${size}).`,
    )
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
