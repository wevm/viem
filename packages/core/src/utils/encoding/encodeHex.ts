import type { Hex } from '../../types'

const hexes = Array.from({ length: 256 }, (v, i) =>
  i.toString(16).padStart(2, '0'),
)

/**
 * @description Encodes a boolean into a hex string
 */
export function boolToHex(value: boolean): Hex {
  return `0x${Number(value)}`
}

/**
 * @description Encodes a bytes32 array into a hex string
 */
export function bytesToHex(value: Uint8Array): Hex {
  let hex = ''
  for (let i = 0; i < value.length; i++) {
    hex += hexes[value[i]]
  }
  return `0x${hex}`
}

/**
 * @description Encodes a string, number, bigint, or Uint8Array into a hex string
 */
export function encodeHex(
  value: string | number | bigint | boolean | Uint8Array,
): Hex {
  if (typeof value === 'number' || typeof value === 'bigint')
    return numberToHex(value)
  if (typeof value === 'string') {
    return stringToHex(value)
  }
  if (typeof value === 'boolean') return boolToHex(value)
  return bytesToHex(value)
}

/**
 * @description Encodes a number or bigint into a hex string
 */
export function numberToHex(value: number | bigint): Hex {
  if (
    value < 0 ||
    (typeof value === 'number' && value > Number.MAX_SAFE_INTEGER)
  )
    throw new Error(
      `Number is not in safe integer range (0 to ${Number.MAX_SAFE_INTEGER})`,
    )
  return `0x${value.toString(16)}`
}

/**
 * @description Encodes a UTF-8 string into a hex string
 */
export function stringToHex(value: string): Hex {
  let hex = ''
  for (let i = 0; i < value.length; i++) {
    hex += value.charCodeAt(i).toString(16)
  }
  return `0x${hex}`
}
