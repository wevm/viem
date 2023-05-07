import { SliceOffsetOutOfBoundsError } from '../../errors/data.js'
import type { ByteArray, Hex } from '../../types/misc.js'

import { isHex } from './isHex.js'
import { size } from './size.js'

export type SliceReturnType<TValue extends ByteArray | Hex> = TValue extends Hex
  ? Hex
  : ByteArray

/**
 * @description Returns a section of the hex or byte array given a start/end bytes offset.
 *
 * @param value The hex or byte array to slice.
 * @param start The start offset (in bytes).
 * @param end The end offset (in bytes).
 */
export function slice<TValue extends ByteArray | Hex>(
  value: TValue,
  start?: number,
  end?: number,
): SliceReturnType<TValue> {
  if (isHex(value))
    return sliceHex(value as Hex, start, end) as SliceReturnType<TValue>
  return sliceBytes(value as ByteArray, start, end) as SliceReturnType<TValue>
}

function assertStartOffset(value: Hex | ByteArray, start?: number) {
  if (typeof start === 'number' && start > 0 && start > size(value) - 1)
    throw new SliceOffsetOutOfBoundsError({ offset: start, size: size(value) })
}

/**
 * @description Returns a section of the byte array given a start/end bytes offset.
 *
 * @param value The byte array to slice.
 * @param start The start offset (in bytes).
 * @param end The end offset (in bytes).
 */
export function sliceBytes(
  value: ByteArray,
  start?: number,
  end?: number,
): ByteArray {
  assertStartOffset(value, start)
  return value.slice(start, end)
}

/**
 * @description Returns a section of the hex value given a start/end bytes offset.
 *
 * @param value The hex value to slice.
 * @param start The start offset (in bytes).
 * @param end The end offset (in bytes).
 */
export function sliceHex(value_: Hex, start?: number, end?: number): Hex {
  assertStartOffset(value_, start)
  const value = value_
    .replace('0x', '')
    .slice((start ?? 0) * 2, (end ?? value_.length) * 2)
  return `0x${value}`
}
