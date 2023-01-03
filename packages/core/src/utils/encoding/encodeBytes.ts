import type { Hex } from '../../types'

const encoder = new TextEncoder()

/** @description Encodes a UTF-8 string or hex string to a byte array. */
export function encodeBytes(value: string | Hex): Uint8Array {
  if (value.startsWith('0x')) return hexToBytes(value as Hex)
  return stringToBytes(value)
}

/**
 * @description Encodes a hex string into a byte array.
 */
export function hexToBytes(hex_: Hex): Uint8Array {
  let hex = hex_.slice(2) as Hex

  if (hex.length % 2) throw new Error('Hex value is unpadded.')

  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index++) {
    const start = index * 2
    const hexByte = hex.slice(start, start + 2)
    const byte = Number.parseInt(hexByte, 16)
    if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence')
    bytes[index] = byte
  }
  return bytes
}

/**
 * @description Encodes a UTF-8 string into a byte array.
 */
export function stringToBytes(value: string): Uint8Array {
  return encoder.encode(value)
}
