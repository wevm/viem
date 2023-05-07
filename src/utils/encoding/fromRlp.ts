import {
  DataLengthTooLongError,
  DataLengthTooShortError,
  InvalidHexValueError,
  OffsetOutOfBoundsError,
} from '../../errors/encoding.js'
import type { ByteArray, Hex } from '../../types/misc.js'

import { bytesToNumber } from './fromBytes.js'
import { hexToBytes } from './toBytes.js'
import { bytesToHex } from './toHex.js'
import type { RecursiveArray } from './toRlp.js'

type FromRlpReturnType<TTo> = TTo extends 'bytes'
  ? ByteArray
  : TTo extends 'hex'
  ? Hex
  : never

export function fromRlp<TTo extends 'bytes' | 'hex'>(
  value: ByteArray | Hex,
  to: TTo,
): RecursiveArray<FromRlpReturnType<TTo>> {
  const bytes = parse(value)
  const [data, consumed] = rlpToBytes(bytes)
  if (consumed < bytes.length)
    throw new DataLengthTooLongError({
      consumed,
      length: bytes.length,
    })
  return format(data, to)
}

function parse(value: ByteArray | Hex) {
  if (typeof value === 'string') {
    if (value.length > 3 && value.length % 2 !== 0)
      throw new InvalidHexValueError(value)
    return hexToBytes(value)
  }
  return value
}

function format<TTo extends 'bytes' | 'hex'>(
  bytes: RecursiveArray<ByteArray>,
  to: TTo,
): RecursiveArray<FromRlpReturnType<TTo>> {
  if (Array.isArray(bytes)) return bytes.map((b) => format(b, to))
  return (to === 'hex' ? bytesToHex(bytes) : bytes) as FromRlpReturnType<TTo>
}

function rlpToBytes(
  bytes: ByteArray,
  offset = 0,
): [result: RecursiveArray<ByteArray>, consumed: number] {
  if (bytes.length === 0) return [new Uint8Array([]), 0]

  const prefix = bytes[offset]

  if (prefix <= 0x7f) return [new Uint8Array([bytes[offset]]), 1]

  if (prefix <= 0xb7) {
    const length = prefix - 0x80
    const offset_ = offset + 1

    if (offset_ + length > bytes.length)
      throw new DataLengthTooShortError({
        length: offset_ + length,
        dataLength: bytes.length,
      })

    return [bytes.slice(offset_, offset_ + length), 1 + length]
  }

  if (prefix <= 0xbf) {
    const lengthOfLength = prefix - 0xb7
    const offset_ = offset + 1
    const length = bytesToNumber(bytes.slice(offset_, offset_ + lengthOfLength))

    if (offset_ + lengthOfLength + length > bytes.length)
      throw new DataLengthTooShortError({
        length: lengthOfLength + length,
        dataLength: bytes.length - lengthOfLength,
      })

    return [
      bytes.slice(offset_ + lengthOfLength, offset_ + lengthOfLength + length),
      1 + lengthOfLength + length,
    ]
  }

  let lengthOfLength = 0
  let length = prefix - 0xc0
  if (prefix > 0xf7) {
    lengthOfLength = prefix - 0xf7
    length = bytesToNumber(bytes.slice(offset + 1, offset + 1 + lengthOfLength))
  }

  let nextOffset = offset + 1 + lengthOfLength
  if (nextOffset > bytes.length)
    throw new DataLengthTooShortError({
      length: nextOffset,
      dataLength: bytes.length,
    })

  const consumed = 1 + lengthOfLength + length
  const result = []
  while (nextOffset < offset + consumed) {
    const decoded = rlpToBytes(bytes, nextOffset)
    result.push(decoded[0])
    nextOffset += decoded[1]
    if (nextOffset > offset + consumed)
      throw new OffsetOutOfBoundsError({
        nextOffset: nextOffset,
        offset: offset + consumed,
      })
  }

  return [result, consumed]
}
