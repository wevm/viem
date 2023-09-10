import type { ByteArray, Hex } from '../../types/misc.js'

export type ConcatReturnType<TValue extends Hex | ByteArray> =
  TValue extends Hex ? Hex : ByteArray

export function concat<TValue extends Hex | ByteArray>(
  values: TValue[],
): ConcatReturnType<TValue> {
  if (typeof values[0] === 'string')
    return concatHex(values as Hex[]) as ConcatReturnType<TValue>
  return concatBytes(values as ByteArray[]) as ConcatReturnType<TValue>
}

export function concatBytes(values: ByteArray[]): ByteArray {
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

export function concatHex(values: Hex[]): Hex {
  return `0x${(values as Hex[]).reduce(
    (acc, x) => acc + x.replace('0x', ''),
    '',
  )}`
}
