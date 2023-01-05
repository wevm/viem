import type { Hex } from '../../types'
import { numberToHex } from './encodeHex'

const encoder = new TextEncoder()

/**
 * @description Encodes a boolean into a byte array.
 */
export function boolToBytes(value: boolean) {
  const bytes = new Uint8Array(1)
  bytes[0] = Number(value)
  return bytes
}

/** @description Encodes a UTF-8 string, hex value, bigint, number or boolean to a byte array. */
export function encodeBytes(
  value: string | bigint | number | boolean | Hex,
): Uint8Array {
  if (typeof value === 'number' || typeof value === 'bigint')
    return numberToBytes(value)
  if (typeof value === 'boolean') return boolToBytes(value)
  if (value.startsWith('0x')) return hexToBytes(value as Hex)
  return stringToBytes(value)
}

/**
 * @description Encodes a hex string into a byte array.
 */
export function hexToBytes(hex_: Hex): Uint8Array {
  let hex = hex_.slice(2) as string

  if (hex.length % 2) hex = '0' + hex

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
 * @description Encodes a number into a byte array.
 */
export function numberToBytes(value: bigint | number) {
  const hex = numberToHex(value)
  return hexToBytes(hex)
}

/**
 * @description Encodes a UTF-8 string into a byte array.
 */
export function stringToBytes(value: string): Uint8Array {
  return encoder.encode(value)
}
