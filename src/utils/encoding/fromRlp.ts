import { BaseError, type BaseErrorType } from '../../errors/base.js'
import { PositionOutOfBoundsError } from '../../errors/cursor.js'
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

const hexRegex = /^0x[0-9a-fA-F]*$/

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
  if (typeof value === 'string' && value.length > 3 && value.length % 2 !== 0)
    throw new InvalidHexValueError(value)

  // Hex in and out: read the input straight from the string.
  if (to === 'hex' && typeof value === 'string' && hexRegex.test(value))
    return fromRlpHex(value) as FromRlpReturnType<to>

  const bytes = typeof value === 'string' ? hexToBytes(value) : value

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

function readLength(
  cursor: Pick<
    Cursor,
    'readUint8' | 'readUint16' | 'readUint24' | 'readUint32'
  >,
  prefix: number,
  offset: number,
) {
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

/** Reads a hex input like a cursor over its bytes, with the same errors. */
type HexReader = Pick<
  Cursor,
  'readUint8' | 'readUint16' | 'readUint24' | 'readUint32'
> & {
  assertPosition(position: number): void
  /** Byte length of the input. */
  length: number
  position: number
  /** Lowercase input without its `0x` prefix. */
  source: string
}

/**
 * Decodes a hex input straight from its string. Matches `hexToBytes` followed
 * by `fromRlpCursor`, including the cursor's bounds errors.
 */
function fromRlpHex(value: Hex): RecursiveArray<Hex> {
  const hex = value.slice(2).toLowerCase()
  const source = hex.length % 2 ? `0${hex}` : hex
  const reader: HexReader = {
    assertPosition(position) {
      if (position < 0 || position > this.length - 1)
        throw new PositionOutOfBoundsError({ length: this.length, position })
    },
    length: source.length / 2,
    position: 0,
    readUint8() {
      return readHexUint(this, 1)
    },
    readUint16() {
      return readHexUint(this, 2)
    },
    readUint24() {
      return readHexUint(this, 3)
    },
    readUint32() {
      return readHexUint(this, 4)
    },
    source,
  }
  if (reader.length === 0) return '0x'
  const result = fromRlpHexItem(reader, 0)
  // RLP payloads encode exactly one item (Yellow Paper, Appendix B).
  if (reader.position < reader.length)
    throw new RlpTrailingBytesError({
      count: reader.length - reader.position,
    })
  return result
}

function fromRlpHexItem(
  reader: HexReader,
  recursiveDepth: number,
): RecursiveArray<Hex> {
  if (recursiveDepth >= rlpDepthLimit)
    throw new RlpDepthLimitExceededError({ limit: rlpDepthLimit })

  const prefix = reader.readUint8()
  if (prefix < 0x80) reader.position--

  // bytes
  if (prefix < 0xc0) {
    const length = readLength(reader, prefix, 0x80)
    const start = reader.position
    reader.assertPosition(start + length - 1)
    reader.position += length
    const value = reader.source.slice(start * 2, reader.position * 2)
    // A single byte below `0x80` is its own encoding (Yellow Paper, Appendix B).
    if (prefix >= 0x80 && length === 1 && value < '80')
      throw new RlpNonCanonicalError({
        reason: 'single byte below `0x80` has a length prefix',
      })
    // A slice keeps the whole input alive, so only leaves of at least half of
    // it (such as a blob) stay slices; `join` copies the rest.
    if (length * 4 < reader.source.length) return ['0x', value].join('') as Hex
    return `0x${value}`
  }

  // list
  const length = readLength(reader, prefix, 0xc0)
  const position = reader.position
  const value: RecursiveArray<Hex>[] = []
  while (reader.position - position < length)
    value.push(fromRlpHexItem(reader, recursiveDepth + 1))
  // Items must consume exactly the declared list length.
  if (reader.position - position !== length)
    throw new RlpListBoundaryExceededError({
      consumed: reader.position - position,
      declared: length,
    })
  return value
}

function readHexUint(reader: HexReader, size: number) {
  const { position } = reader
  reader.assertPosition(position + size - 1)
  reader.position += size
  return Number.parseInt(
    reader.source.slice(position * 2, reader.position * 2),
    16,
  )
}
