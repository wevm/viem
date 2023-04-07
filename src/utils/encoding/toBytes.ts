import { BaseError } from '../../errors/index.js'
import type { ByteArray, Hex } from '../../types/index.js'
import { isHex } from '../data/isHex.js'
import type { NumberToHexOpts } from './toHex.js'
import { numberToHex } from './toHex.js'

const encoder = new TextEncoder()

/** @description Encodes a UTF-8 string, hex value, bigint, number or boolean to a byte array. */
export function toBytes(
  value: string | bigint | number | boolean | Hex,
): ByteArray {
  if (typeof value === 'number' || typeof value === 'bigint')
    return numberToBytes(value)
  if (typeof value === 'boolean') return boolToBytes(value)
  if (isHex(value)) return hexToBytes(value)
  return stringToBytes(value)
}

/**
 * @description Encodes a boolean into a byte array.
 */
export function boolToBytes(value: boolean) {
  const bytes = new Uint8Array(1)
  bytes[0] = Number(value)
  return bytes
}

/**
 * @description Encodes a hex string into a byte array.
 */
export function hexToBytes(hex_: Hex): ByteArray {
  let hex = hex_.slice(2) as string

  if (hex.length % 2) hex = `0${hex}`

  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index++) {
    const start = index * 2
    const hexByte = hex.slice(start, start + 2)
    const byte = Number.parseInt(hexByte, 16)
    if (Number.isNaN(byte) || byte < 0)
      throw new BaseError(`Invalid byte sequence ("${hexByte}" in "${hex}").`)
    bytes[index] = byte
  }
  return bytes
}

/**
 * @description Encodes a number into a byte array.
 */
export function numberToBytes(value: bigint | number, opts?: NumberToHexOpts) {
  const hex = numberToHex(value, opts)
  return hexToBytes(hex)
}

/**
 * @description Encodes a UTF-8 string into a byte array.
 */
export function stringToBytes(value: string): ByteArray {
  return encoder.encode(value)
}
