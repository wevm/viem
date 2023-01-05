import type { ByteArray, Hex } from '../../types'
import { hexToBytes } from './encodeBytes'

type DecodeHexResponse<TTo> = TTo extends 'string'
  ? string
  : TTo extends 'bigint'
  ? bigint
  : TTo extends 'number'
  ? number
  : TTo extends 'bytes'
  ? ByteArray
  : TTo extends 'boolean'
  ? boolean
  : never

/**
 * @description Decodes a hex string into a string, number, bigint, boolean, or bytes32 array.
 */
export function decodeHex<
  TTo extends 'string' | 'bigint' | 'number' | 'bytes' | 'boolean',
>(hex: Hex, to: TTo): DecodeHexResponse<TTo> {
  if (to === 'number') return hexToNumber(hex) as DecodeHexResponse<TTo>
  if (to === 'bigint') return hexToBigInt(hex) as DecodeHexResponse<TTo>
  if (to === 'string') return hexToString(hex) as DecodeHexResponse<TTo>
  if (to === 'boolean') return hexToBool(hex) as DecodeHexResponse<TTo>
  return hexToBytes(hex) as DecodeHexResponse<TTo>
}

/**
 * @description Decodes a hex string into a bigint.
 */
export function hexToBigInt(hex: Hex): bigint {
  return BigInt(hex)
}

/**
 * @description Decodes a hex string into a boolean.
 */
export function hexToBool(hex: Hex): boolean {
  if (hex === '0x0') return false
  if (hex === '0x1') return true
  throw new Error('Hex value is not a valid boolean.')
}

/**
 * @description Decodes a hex string into a number.
 */
export function hexToNumber(hex: Hex): number {
  return Number(BigInt(hex))
}

/**
 * @description Decodes a hex string into a UTF-8 string.
 */
export function hexToString(hex: Hex): string {
  const bytes = hexToBytes(hex)
  return new TextDecoder().decode(bytes)
}
