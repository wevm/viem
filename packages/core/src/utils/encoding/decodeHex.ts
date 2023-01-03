import type { Hex } from '../../types'
import { hexToBytes } from './encodeBytes'

type DecodeHexResponse<TTo> = TTo extends 'string'
  ? string
  : TTo extends 'bigint'
  ? bigint
  : TTo extends 'number'
  ? number
  : TTo extends 'bytes'
  ? Uint8Array
  : never

/**
 * @description Decodes a hex string into a string, number, bigint, or bytes (Uint8Array).
 */
export function decodeHex<TTo extends 'string' | 'bigint' | 'number' | 'bytes'>(
  hex: Hex,
  to: TTo,
): DecodeHexResponse<TTo> {
  if (to === 'number') return hexToNumber(hex) as DecodeHexResponse<TTo>
  if (to === 'bigint') return hexToBigInt(hex) as DecodeHexResponse<TTo>
  if (to === 'string') return hexToString(hex) as DecodeHexResponse<TTo>
  return hexToBytes(hex) as DecodeHexResponse<TTo>
}

/**
 * @description Decodes a hex string into a number.
 */
export function hexToNumber(hex: Hex): number {
  return Number(BigInt(hex))
}

/**
 * @description Decodes a hex string into a bigint.
 */
export function hexToBigInt(hex: Hex): bigint {
  return BigInt(hex)
}

/**
 * @description Decodes a hex string into a UTF-8 string.
 */
export function hexToString(hex: Hex): string {
  const bytes = hexToBytes(hex)
  return new TextDecoder().decode(bytes)
}
