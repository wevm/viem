import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'

type TrimOptions = {
  dir?: 'left' | 'right' | undefined
}
export type TrimReturnType<value extends ByteArray | Hex> = value extends Hex
  ? Hex
  : ByteArray

export type TrimErrorType = ErrorType

export function trim<value extends ByteArray | Hex>(
  hexOrBytes: value,
  { dir = 'left' }: TrimOptions = {},
): TrimReturnType<value> {
  if (typeof hexOrBytes === 'string') {
    let data = hexOrBytes.startsWith('0x')
      ? hexOrBytes.slice(2)
      : hexOrBytes.replace('0x', '')
    // Count leading zero digits, or trailing zero bytes, keeping one byte.
    let count = 0
    if (dir === 'left') {
      while (count < data.length - 1 && data.charCodeAt(count) === 48) count++
      data = data.slice(count)
    } else {
      while (
        count < data.length - 2 &&
        data.charCodeAt(data.length - count - 1) === 48 &&
        data.charCodeAt(data.length - count - 2) === 48
      )
        count += 2
      data = data.slice(0, data.length - count)
    }
    if (data.length === 1 && dir === 'right') data = `${data}0`
    return `0x${
      data.length % 2 === 1 ? `0${data}` : data
    }` as TrimReturnType<value>
  }

  const data = hexOrBytes as ByteArray
  let count = 0
  if (dir === 'left') {
    while (count < data.length - 1 && data[count] === 0) count++
    return data.slice(count) as TrimReturnType<value>
  }
  while (count < data.length - 1 && data[data.length - count - 1] === 0) count++
  return data.slice(0, data.length - count) as TrimReturnType<value>
}
