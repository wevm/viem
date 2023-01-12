import type { ByteArray, Hex } from '../../types'
import { isHex } from './isHex'

/**
 * @description Retrieves the size of the value (in bytes).
 *
 * @param value The value (hex or byte array) to retrieve the size of.
 * @returns The size of the value (in bytes).
 */
export function size(value: Hex | ByteArray) {
  if (isHex(value)) return Math.ceil((value.length - 2) / 2)
  return value.length
}
