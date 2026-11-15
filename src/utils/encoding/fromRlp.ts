import { BaseError, type BaseErrorType } from '../../errors/base.js'
import {
  InvalidHexValueError,
  type InvalidHexValueErrorType,
  RlpDepthLimitExceededError,
  type RlpDepthLimitExceededErrorType,
  RlpListBoundaryExceededError,
  type RlpListBoundaryExceededErrorType,
  RlpNonCanonicalError,
  type RlpNonCanonicalErrorType,
  RlpTrailingBytesError,
  type RlpTrailingBytesErrorType,
} from '../../errors/encoding.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import {
  type CreateCursorErrorType,
  type Cursor,
  createCursor,
} from '../cursor.js'
import { type HexToBytesErrorType, hexToBytes } from './toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from './toHex.js'

import type { RecursiveArray } from './toRlp.js'

type To = 'hex' | 'bytes'

const rlpDepthLimit = 1_024

export type FromRlpReturnType<to extends To> =
  | (to extends 'bytes' ? RecursiveArray<ByteArray> : never)
  | (to extends 'hex' ? RecursiveArray<Hex> : never)

export type FromRlpErrorType =
  | CreateCursorErrorType
  | FromRlpCursorErrorType
  | HexToBytesErrorType
  | InvalidHexValueErrorType
  | RlpDepthLimitExceededErrorType
  | RlpNonCanonicalErrorType
  | RlpTrailingBytesErrorType
  | ErrorType

export function fromRlp<to extends To = 'hex'>(
  value: ByteArray | Hex,
  to: to | To | undefined = 'hex',
): FromRlpReturnType<to> {
  const bytes = (() => {
    if (typeof value === 'string') {
      if (value.length > 3 && value.length % 2 !== 0)
        throw new InvalidHexValueError(value)
      return hexToBytes(value)
    }
    return value
  })()

  const cursor = createCursor(bytes, {
    recursiveReadLimit: Number.POSITIVE_INFINITY,
  })
  const result = fromRlpCursor(cursor, to)

  // RLP payloads encode exactly one item (Yellow Paper, Appendix B).
  if (cursor.position < cursor.bytes.length)
    throw new RlpTrailingBytesError({
      count: cursor.bytes.length - cursor.position,
    })

  return result as FromRlpReturnType<to>
}

type FromRlpCursorErrorType =
  | BytesToHexErrorType
  | ReadLengthErrorType
  | ReadListErrorType
  | ErrorType

function fromRlpCursor<to extends To = 'hex'>(
  cursor: Cursor,
  to: to | To | undefined = 'hex',
  recursiveDepth = 0,
): FromRlpReturnType<to> {
  if (recursiveDepth >= rlpDepthLimit)
    throw new RlpDepthLimitExceededError({ limit: rlpDepthLimit })

  if (cursor.bytes.length === 0)
    return (
      to === 'hex' ? bytesToHex(cursor.bytes) : cursor.bytes
    ) as FromRlpReturnType<to>

  const prefix = cursor.readByte()
  if (prefix < 0x80) cursor.decrementPosition(1)

  // bytes
  if (prefix < 0xc0) {
    const length = readLength(cursor, prefix, 0x80)
    const bytes = cursor.readBytes(length)
    // A single byte below `0x80` is its own encoding (Yellow Paper, Appendix B).
    if (prefix >= 0x80 && length === 1 && bytes[0]! < 0x80)
      throw new RlpNonCanonicalError({
        reason: 'single byte below `0x80` has a length prefix',
      })
    return (to === 'hex' ? bytesToHex(bytes) : bytes) as FromRlpReturnType<to>
  }

  // list
  const length = readLength(cursor, prefix, 0xc0)
  return readList(
    cursor,
    length,
    to,
    recursiveDepth + 1,
  ) as {} as FromRlpReturnType<to>
}

type ReadLengthErrorType = BaseErrorType | RlpNonCanonicalErrorType | ErrorType

function readLength(cursor: Cursor, prefix: number, offset: number) {
  if (offset === 0x80 && prefix < 0x80) return 1
  if (prefix <= offset + 55) return prefix - offset
  // Long-form lengths must be above 55 and have no leading zero bytes
  // (Yellow Paper, Appendix B).
  if (prefix === offset + 55 + 1) {
    const length = cursor.readUint8()
    if (length <= 55) throw nonCanonicalLengthError(length)
    return length
  }
  if (prefix === offset + 55 + 2) {
    const length = cursor.readUint16()
    if (length <= 0xff) throw nonCanonicalLengthError(length)
    return length
  }
  if (prefix === offset + 55 + 3) {
    const length = cursor.readUint24()
    if (length <= 0xffff) throw nonCanonicalLengthError(length)
    return length
  }
  if (prefix === offset + 55 + 4) {
    const length = cursor.readUint32()
    if (length <= 0xffffff) throw nonCanonicalLengthError(length)
    return length
  }
  throw new BaseError('Invalid RLP prefix')
}

function nonCanonicalLengthError(length: number) {
  return new RlpNonCanonicalError({
    reason: `length \`${length}\` does not use the shortest length prefix`,
  })
}

type ReadListErrorType = RlpListBoundaryExceededErrorType | ErrorType

function readList<to extends To>(
  cursor: Cursor,
  length: number,
  to: to | To,
  recursiveDepth: number,
) {
  const position = cursor.position
  const value: FromRlpReturnType<to>[] = []
  while (cursor.position - position < length)
    value.push(fromRlpCursor(cursor, to, recursiveDepth))
  // Items must consume exactly the declared list length.
  if (cursor.position - position !== length)
    throw new RlpListBoundaryExceededError({
      consumed: cursor.position - position,
      declared: length,
    })
  return value
}
