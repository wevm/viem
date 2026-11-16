import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'

export type ConcatReturnType<value extends Hex | ByteArray> = value extends Hex
  ? Hex
  : ByteArray

export type ConcatErrorType =
  | ConcatBytesErrorType
  | ConcatHexErrorType
  | ErrorType

export function concat<value extends Hex | ByteArray>(
  values: readonly value[],
): ConcatReturnType<value> {
  if (typeof values[0] === 'string')
    return concatHex(values as readonly Hex[]) as ConcatReturnType<value>
  return concatBytes(values as readonly ByteArray[]) as ConcatReturnType<value>
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
  let result = ''
  for (const value of values)
    result += value.startsWith('0x') ? value.slice(2) : value.replace('0x', '')
  return `0x${result}`
}
