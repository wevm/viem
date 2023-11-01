import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'

export type ConcatReturnType<TValue extends Hex | ByteArray> =
  TValue extends Hex ? Hex : ByteArray

export type ConcatErrorType =
  | ConcatBytesErrorType
  | ConcatHexErrorType
  | ErrorType

export function concat<TValue extends Hex | ByteArray>(
  values: readonly TValue[],
): ConcatReturnType<TValue> {
  if (typeof values[0] === 'string')
    return concatHex(values as readonly Hex[]) as ConcatReturnType<TValue>
  return concatBytes(values as readonly ByteArray[]) as ConcatReturnType<TValue>
}

export type ConcatBytesErrorType = ErrorType

export function concatBytes(values: readonly ByteArray[]): ByteArray {
  let length = 0
  for (const arr of values) {
    length += arr.length
  }
  const result = new Uint8Array(length)
  let offset = 0
  for (const arr of values) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

export type ConcatHexErrorType = ErrorType

export function concatHex(values: readonly Hex[]): Hex {
  return `0x${(values as Hex[]).reduce(
    (acc, x) => acc + x.replace('0x', ''),
    '',
  )}`
}
