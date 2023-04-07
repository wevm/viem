import { pad } from '../data/index.js'
import type { ByteArray, Hex } from '../../types/index.js'
import { IntegerOutOfRangeError } from '../../errors/index.js'

const hexes = Array.from({ length: 256 }, (_v, i) =>
  i.toString(16).padStart(2, '0'),
)

/**
 * @description Encodes a boolean into a hex string
 */
export function boolToHex(value: boolean): Hex {
  return `0x${Number(value)}`
}

/**
 * @description Encodes a bytes array into a hex string
 */
export function bytesToHex(value: ByteArray): Hex {
  let hex = ''
  for (let i = 0; i < value.length; i++) {
    hex += hexes[value[i]]
  }
  return `0x${hex}`
}

/**
 * @description Encodes a string, number, bigint, or ByteArray into a hex string
 */
export function toHex(
  value: string | number | bigint | boolean | ByteArray,
): Hex {
  if (typeof value === 'number' || typeof value === 'bigint')
    return numberToHex(value)
  if (typeof value === 'string') {
    return stringToHex(value)
  }
  if (typeof value === 'boolean') return boolToHex(value)
  return bytesToHex(value)
}

export type NumberToHexOpts =
  | {
      // Whether or not the number of a signed representation.
      signed?: boolean
      // The size of the output hex (in bytes).
      size: number
    }
  | {
      signed?: never
      size?: never
    }

/**
 * @description Encodes a number or bigint into a hex string
 */
export function numberToHex(
  value_: number | bigint,
  opts: NumberToHexOpts = {},
): Hex {
  const { signed, size } = opts

  const value = BigInt(value_)

  let maxValue
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

  const hex = `0x${(signed && value < 0
    ? (1n << BigInt(size * 8)) + BigInt(value)
    : value
  ).toString(16)}` as Hex
  if (size) return pad(hex, { size }) as Hex
  return hex
}

const encoder = new TextEncoder()

/**
 * @description Encodes a UTF-8 string into a hex string
 */
export function stringToHex(value_: string): Hex {
  const value = encoder.encode(value_)
  return toHex(value)
}
