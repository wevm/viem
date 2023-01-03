import type { Hex } from '../../types'

const hexes = Array.from({ length: 256 }, (v, i) =>
  i.toString(16).padStart(2, '0'),
)

/**
 * @description Encodes a string, number, bigint, or Uint8Array into a hex string
 */
export function encodeHex(value: string | number | bigint | Uint8Array): Hex {
  if (typeof value === 'number' || typeof value === 'bigint')
    return numberToHex(value)
  if (typeof value === 'string') {
    return stringToHex(value)
  }
  return bytesToHex(value)
}

/**
 * @description Encodes a number or bigint into a hex string
 */
export function numberToHex(value: number | bigint): Hex {
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

/**
 * @description Encodes a Uint8Array into a hex string
 */
export function bytesToHex(value: Uint8Array): Hex {
  let hex = ''
  for (let i = 0; i < value.length; i++) {
    hex += hexes[value[i]]
  }
  return `0x${hex}`
}
