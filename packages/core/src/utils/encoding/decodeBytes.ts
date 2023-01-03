import type { Hex } from '../../types'
import { bytesToHex } from './encodeHex'

type DecodeBytesResponse<TTo> = TTo extends 'string'
  ? string
  : TTo extends 'hex'
  ? Hex
  : never

/**
 * @description Decodes a byte array into a UTF-8 string or hex value.
 */
export function decodeBytes<TTo extends 'string' | 'hex'>(
  bytes: Uint8Array,
  to: TTo,
): DecodeBytesResponse<TTo> {
  if (to === 'string') return bytesToString(bytes) as DecodeBytesResponse<TTo>
  return bytesToHex(bytes) as DecodeBytesResponse<TTo>
}

export { bytesToHex }

/**
 * @description Decodes a UTF-8 byte array into a UTF-8 string.
 */
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}
