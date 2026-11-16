import {
  IntegerOutOfRangeError,
  type IntegerOutOfRangeErrorType,
} from '../../errors/encoding.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type PadErrorType, pad } from '../data/pad.js'

import { type AssertSizeErrorType, assertSize } from './fromHex.js'
import { stringToBytes } from './toBytes.js'

const hexes = /*#__PURE__*/ Array.from({ length: 256 }, (_v, i) =>
  i.toString(16).padStart(2, '0'),
)

// Native `Uint8Array.prototype.toHex` (Node 25+, Chrome 140+, Firefox 133+, Safari 18.2+).
const nativeToHex = /*#__PURE__*/ (() =>
  (
    Uint8Array.prototype as {
      toHex?: ((this: Uint8Array) => string) | undefined
    }
  ).toHex)()

export type ToHexParameters = {
  /** The size (in bytes) of the output hex value. */
  size?: number | undefined
}

export type ToHexErrorType =
  | BoolToHexErrorType
  | BytesToHexErrorType
  | NumberToHexErrorType
  | StringToHexErrorType
  | ErrorType

/**
 * Encodes a string, number, bigint, or ByteArray into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex
 * - Example: https://viem.sh/docs/utilities/toHex#usage
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { toHex } from 'viem'
 * const data = toHex('Hello world')
 * // '0x48656c6c6f20776f726c6421'
 *
 * @example
 * import { toHex } from 'viem'
 * const data = toHex(420)
 * // '0x1a4'
 *
 * @example
 * import { toHex } from 'viem'
 * const data = toHex('Hello world', { size: 32 })
 * // '0x48656c6c6f20776f726c64210000000000000000000000000000000000000000'
 */
export function toHex(
  value: string | number | bigint | boolean | ByteArray,
  opts: ToHexParameters = {},
): Hex {
  if (typeof value === 'number' || typeof value === 'bigint')
    return numberToHex(value, opts)
  if (typeof value === 'string') {
    return stringToHex(value, opts)
  }
  if (typeof value === 'boolean') return boolToHex(value, opts)
  return bytesToHex(value, opts)
}

export type BoolToHexOpts = {
  /** The size (in bytes) of the output hex value. */
  size?: number | undefined
}

export type BoolToHexErrorType = AssertSizeErrorType | PadErrorType | ErrorType

/**
 * Encodes a boolean into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex#booltohex
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { boolToHex } from 'viem'
 * const data = boolToHex(true)
 * // '0x1'
 *
 * @example
 * import { boolToHex } from 'viem'
 * const data = boolToHex(false)
 * // '0x0'
 *
 * @example
 * import { boolToHex } from 'viem'
 * const data = boolToHex(true, { size: 32 })
 * // '0x0000000000000000000000000000000000000000000000000000000000000001'
 */
export function boolToHex(value: boolean, opts: BoolToHexOpts = {}): Hex {
  const hex: Hex = `0x${Number(value)}`
  if (typeof opts.size === 'number') {
    assertSize(hex, { size: opts.size })
    return pad(hex, { size: opts.size })
  }
  return hex
}

export type BytesToHexOpts = {
  /** The size (in bytes) of the output hex value. */
  size?: number | undefined
}

export type BytesToHexErrorType = AssertSizeErrorType | PadErrorType | ErrorType

/**
 * Encodes a bytes array into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex#bytestohex
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { bytesToHex } from 'viem'
 * const data = bytesToHex(Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
 * // '0x48656c6c6f20576f726c6421'
 *
 * @example
 * import { bytesToHex } from 'viem'
 * const data = bytesToHex(Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]), { size: 32 })
 * // '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'
 */
export function bytesToHex(value: ByteArray, opts: BytesToHexOpts = {}): Hex {
  let string = ''
  // Detached and out-of-bounds views have length 0 and make native `toHex`
  // throw, so empty views use the loop.
  if (nativeToHex && value instanceof Uint8Array && value.length > 0)
    string = nativeToHex.call(value)
  else
    for (let i = 0; i < value.length; i++) {
      string += hexes[value[i]]
    }
  const hex = `0x${string}` as const

  if (typeof opts.size === 'number') {
    assertSize(hex, { size: opts.size })
    return pad(hex, { dir: 'right', size: opts.size })
  }
  return hex
}

export type NumberToHexOpts =
  | {
      /** Whether or not the number of a signed representation. */
      signed?: boolean | undefined
      /** The size (in bytes) of the output hex value. */
      size: number
    }
  | {
      signed?: undefined
      /** The size (in bytes) of the output hex value. */
      size?: number | undefined
    }

export type NumberToHexErrorType =
  | IntegerOutOfRangeErrorType
  | PadErrorType
  | ErrorType

/**
 * Encodes a number or bigint into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex#numbertohex
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { numberToHex } from 'viem'
 * const data = numberToHex(420)
 * // '0x1a4'
 *
 * @example
 * import { numberToHex } from 'viem'
 * const data = numberToHex(420, { size: 32 })
 * // '0x00000000000000000000000000000000000000000000000000000000000001a4'
 */
export function numberToHex(
  value_: number | bigint,
  opts: NumberToHexOpts = {},
): Hex {
  const { signed, size } = opts

  // Unsigned values fit `size` bytes when their hex has at most `size * 2`
  // digits, so skip the bigint bounds. Anything else takes the checks below.
  if (
    !signed &&
    (typeof value_ === 'bigint'
      ? value_ >= 0n
      : Number.isSafeInteger(value_) && value_ >= 0)
  ) {
    const hex = value_.toString(16)
    if (!size) return `0x${hex}`
    if (Number.isSafeInteger(size) && size > 0 && hex.length <= size * 2)
      return `0x${hex.padStart(size * 2, '0')}`
  }

  const value = BigInt(value_)

  let maxValue: bigint | number | undefined
  if (size) {
    if (signed) maxValue = (1n << (BigInt(size) * 8n - 1n)) - 1n
    else maxValue = 2n ** (BigInt(size) * 8n) - 1n
  } else if (typeof value_ === 'number') {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER)
  }

  const minValue = typeof maxValue === 'bigint' && signed ? -maxValue - 1n : 0

  if ((maxValue && value > maxValue) || value < minValue) {
    const suffix = typeof value_ === 'bigint' ? 'n' : ''
    throw new IntegerOutOfRangeError({
      max: maxValue ? `${maxValue}${suffix}` : undefined,
      min: `${minValue}${suffix}`,
      signed,
      size,
      value: `${value_}${suffix}`,
    })
  }

  const hex = `0x${(
    signed && value < 0 ? (1n << BigInt(size * 8)) + BigInt(value) : value
  ).toString(16)}` as Hex
  if (size) return pad(hex, { size }) as Hex
  return hex
}

export type StringToHexOpts = {
  /** The size (in bytes) of the output hex value. */
  size?: number | undefined
}

export type StringToHexErrorType = BytesToHexErrorType | ErrorType

/**
 * Encodes a UTF-8 string into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex#stringtohex
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { stringToHex } from 'viem'
 * const data = stringToHex('Hello World!')
 * // '0x48656c6c6f20576f726c6421'
 *
 * @example
 * import { stringToHex } from 'viem'
 * const data = stringToHex('Hello World!', { size: 32 })
 * // '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'
 */
export function stringToHex(value_: string, opts: StringToHexOpts = {}): Hex {
  return bytesToHex(stringToBytes(value_), opts)
}
