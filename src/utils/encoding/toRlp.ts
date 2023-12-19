import type { ErrorType } from '../../errors/utils.js'
import { BaseError } from '../../index.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import {
  type CreateCursorErrorType,
  type Cursor,
  createCursor,
} from '../cursor.js'

import { type HexToBytesErrorType, hexToBytes } from './toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from './toHex.js'

export type RecursiveArray<T> = T | RecursiveArray<T>[]

type To = 'hex' | 'bytes'

type Encodable = {
  length: number
  encode(cursor: Cursor): void
}

export type ToRlpReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export type ToRlpErrorType =
  | CreateCursorErrorType
  | BytesToHexErrorType
  | HexToBytesErrorType
  | ErrorType

export function toRlp<to extends To = 'hex'>(
  bytes: RecursiveArray<ByteArray> | RecursiveArray<Hex>,
  to: to | To | undefined = 'hex',
): ToRlpReturnType<to> {
  const encodable = getEncodable(bytes)
  const cursor = createCursor(new Uint8Array(encodable.length))
  encodable.encode(cursor)

  if (to === 'hex') return bytesToHex(cursor.bytes) as ToRlpReturnType<to>
  return cursor.bytes as ToRlpReturnType<to>
}

export type BytesToRlpErrorType = ToRlpErrorType | ErrorType

export function bytesToRlp<to extends To = 'bytes'>(
  bytes: RecursiveArray<ByteArray>,
  to: to | To | undefined = 'bytes',
): ToRlpReturnType<to> {
  return toRlp(bytes, to)
}

export type HexToRlpErrorType = ToRlpErrorType | ErrorType

export function hexToRlp<to extends To = 'hex'>(
  hex: RecursiveArray<Hex>,
  to: to | To | undefined = 'hex',
): ToRlpReturnType<to> {
  return toRlp(hex, to)
}

function getEncodable(
  bytes: RecursiveArray<ByteArray> | RecursiveArray<Hex>,
): Encodable {
  if (Array.isArray(bytes))
    return getEncodableList(bytes.map((x) => getEncodable(x)))
  return getEncodableBytes(bytes)
}

function getEncodableList(list: Encodable[]): Encodable {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0)

  const sizeOfBodyLength = getSizeOfLength(bodyLength)
  const length = (() => {
    if (bodyLength <= 55) return 1 + bodyLength
    return 1 + sizeOfBodyLength + bodyLength
  })()

  return {
    length,
    encode(cursor: Cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(0xc0 + bodyLength)
      } else {
        cursor.pushByte(0xc0 + 55 + sizeOfBodyLength)
        if (sizeOfBodyLength === 1) cursor.pushUint8(bodyLength)
        else if (sizeOfBodyLength === 2) cursor.pushUint16(bodyLength)
        else if (sizeOfBodyLength === 3) cursor.pushUint24(bodyLength)
        else cursor.pushUint32(bodyLength)
      }
      for (const { encode } of list) {
        encode(cursor)
      }
    },
  }
}

function getEncodableBytes(bytesOrHex: ByteArray | Hex): Encodable {
  const bytes =
    typeof bytesOrHex === 'string' ? hexToBytes(bytesOrHex) : bytesOrHex

  const sizeOfBytesLength = getSizeOfLength(bytes.length)
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 0x80) return 1
    if (bytes.length <= 55) return 1 + bytes.length
    return 1 + sizeOfBytesLength + bytes.length
  })()

  return {
    length,
    encode(cursor: Cursor) {
      if (bytes.length === 1 && bytes[0] < 0x80) {
        cursor.pushBytes(bytes)
      } else if (bytes.length <= 55) {
        cursor.pushByte(0x80 + bytes.length)
        cursor.pushBytes(bytes)
      } else {
        cursor.pushByte(0x80 + 55 + sizeOfBytesLength)
        if (sizeOfBytesLength === 1) cursor.pushUint8(bytes.length)
        else if (sizeOfBytesLength === 2) cursor.pushUint16(bytes.length)
        else if (sizeOfBytesLength === 3) cursor.pushUint24(bytes.length)
        else cursor.pushUint32(bytes.length)
        cursor.pushBytes(bytes)
      }
    },
  }
}

function getSizeOfLength(length: number) {
  if (length < 2 ** 8) return 1
  if (length < 2 ** 16) return 2
  if (length < 2 ** 24) return 3
  if (length < 2 ** 32) return 4
  throw new BaseError('Length is too large.')
}
