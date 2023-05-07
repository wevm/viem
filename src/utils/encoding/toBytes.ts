import { BaseError } from '../../errors/base.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { isHex } from '../data/isHex.js'
import { pad } from '../data/pad.js'

import { assertSize } from './fromHex.js'
import { type NumberToHexOpts, numberToHex } from './toHex.js'

const encoder = new TextEncoder()

export type ToBytesParameters = {
  /** Size of the output bytes. */
  size?: number
}

/**
 * Encodes a UTF-8 string, hex value, bigint, number or boolean to a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes.html
 * - Example: https://viem.sh/docs/utilities/toBytes.html#usage
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { toBytes } from 'viem'
 * const data = toBytes('Hello world')
 * // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
 *
 * @example
 * import { toBytes } from 'viem'
 * const data = toBytes(420)
 * // Uint8Array([1, 164])
 *
 * @example
 * import { toBytes } from 'viem'
 * const data = toBytes(420, { size: 4 })
 * // Uint8Array([0, 0, 1, 164])
 */
export function toBytes(
  value: string | bigint | number | boolean | Hex,
  opts: ToBytesParameters = {},
): ByteArray {
  if (typeof value === 'number' || typeof value === 'bigint')
    return numberToBytes(value, opts)
  if (typeof value === 'boolean') return boolToBytes(value, opts)
  if (isHex(value)) return hexToBytes(value, opts)
  return stringToBytes(value, opts)
}

export type BoolToHexOpts = {
  /** Size of the output bytes. */
  size?: number
}

/**
 * Encodes a boolean into a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes.html#booltobytes
 *
 * @param value Boolean value to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { boolToBytes } from 'viem'
 * const data = boolToBytes(true)
 * // Uint8Array([1])
 *
 * @example
 * import { boolToBytes } from 'viem'
 * const data = boolToBytes(true, { size: 32 })
 * // Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
 */
export function boolToBytes(value: boolean, opts: BoolToHexOpts = {}) {
  const bytes = new Uint8Array(1)
  bytes[0] = Number(value)
  if (typeof opts.size === 'number') {
    assertSize(bytes, { size: opts.size })
    return pad(bytes, { size: opts.size })
  }
  return bytes
}

export type HexToBytesOpts = {
  /** Size of the output bytes. */
  size?: number
}

/**
 * Encodes a hex string into a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes.html#hextobytes
 *
 * @param hex Hex string to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { hexToBytes } from 'viem'
 * const data = hexToBytes('0x48656c6c6f20776f726c6421')
 * // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
 *
 * @example
 * import { hexToBytes } from 'viem'
 * const data = hexToBytes('0x48656c6c6f20776f726c6421', { size: 32 })
 * // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
 */
export function hexToBytes(hex_: Hex, opts: HexToBytesOpts = {}): ByteArray {
  let hex = hex_
  if (opts.size) {
    assertSize(hex, { size: opts.size })
    hex = pad(hex, { dir: 'right', size: opts.size })
  }

  let hexString = hex.slice(2) as string
  if (hexString.length % 2) hexString = `0${hexString}`

  const bytes = new Uint8Array(hexString.length / 2)
  for (let index = 0; index < bytes.length; index++) {
    const start = index * 2
    const hexByte = hexString.slice(start, start + 2)
    const byte = Number.parseInt(hexByte, 16)
    if (Number.isNaN(byte) || byte < 0)
      throw new BaseError(
        `Invalid byte sequence ("${hexByte}" in "${hexString}").`,
      )
    bytes[index] = byte
  }
  return bytes
}

/**
 * Encodes a number into a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes.html#numbertobytes
 *
 * @param value Number to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { numberToBytes } from 'viem'
 * const data = numberToBytes(420)
 * // Uint8Array([1, 164])
 *
 * @example
 * import { numberToBytes } from 'viem'
 * const data = numberToBytes(420, { size: 4 })
 * // Uint8Array([0, 0, 1, 164])
 */
export function numberToBytes(value: bigint | number, opts?: NumberToHexOpts) {
  const hex = numberToHex(value, opts)
  return hexToBytes(hex)
}

export type StringToBytesOpts = {
  /** Size of the output bytes. */
  size?: number
}

/**
 * Encodes a UTF-8 string into a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes.html#stringtobytes
 *
 * @param value String to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { stringToBytes } from 'viem'
 * const data = stringToBytes('Hello world!')
 * // Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33])
 *
 * @example
 * import { stringToBytes } from 'viem'
 * const data = stringToBytes('Hello world!', { size: 32 })
 * // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
 */
export function stringToBytes(
  value: string,
  opts: StringToBytesOpts = {},
): ByteArray {
  const bytes = encoder.encode(value)
  if (typeof opts.size === 'number') {
    assertSize(bytes, { size: opts.size })
    return pad(bytes, { dir: 'right', size: opts.size })
  }
  return bytes
}
