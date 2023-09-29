import {
  NegativeOffsetError,
  PositionOutOfBoundsError,
} from '../errors/cursor.js'
import type { ErrorType } from '../errors/utils.js'
import type { ByteArray } from '../types/misc.js'

export type Cursor = {
  bytes: ByteArray
  dataView: DataView
  position: number
  assertPosition(position: number): void
  decrementPosition(offset: number): void
  incrementPosition(offset: number): void
  inspectByte(position?: number): ByteArray[number]
  inspectBytes(length: number, position?: number): ByteArray
  inspectUint8(position?: number): number
  inspectUint16(position?: number): number
  inspectUint24(position?: number): number
  inspectUint32(position?: number): number
  pushByte(byte: ByteArray[number]): void
  pushBytes(bytes: ByteArray): void
  pushUint8(value: number): void
  pushUint16(value: number): void
  pushUint24(value: number): void
  pushUint32(value: number): void
  readByte(): ByteArray[number]
  readBytes(length: number): ByteArray
  readUint8(): number
  readUint16(): number
  readUint24(): number
  readUint32(): number
  setPosition(position: number): void
}

export type CreateCursorErrorType = ErrorType

export type CursorErrorType =
  | CursorAssertPositionErrorType
  | CursorDecrementPositionErrorType
  | CursorIncrementPositionErrorType
  | ErrorType

export type CursorAssertPositionErrorType = PositionOutOfBoundsError | ErrorType

export type CursorDecrementPositionErrorType = NegativeOffsetError | ErrorType

export type CursorIncrementPositionErrorType = NegativeOffsetError | ErrorType

const staticCursor: Cursor = {
  bytes: new Uint8Array(),
  dataView: new DataView(new ArrayBuffer(0)),
  position: 0,
  assertPosition(position) {
    if (position < 0 || position > this.bytes.length - 1)
      throw new PositionOutOfBoundsError({
        length: this.bytes.length,
        position,
      })
  },
  decrementPosition(offset) {
    if (offset < 0) throw new NegativeOffsetError({ offset })
    const position = this.position - offset
    this.assertPosition(position)
    this.position = position
  },
  incrementPosition(offset) {
    if (offset < 0) throw new NegativeOffsetError({ offset })
    const position = this.position + offset
    this.assertPosition(position)
    this.position = position
  },
  inspectByte(position_) {
    const position = position_ ?? this.position
    this.assertPosition(position)
    return this.bytes[position]
  },
  inspectBytes(length, position_) {
    const position = position_ ?? this.position
    this.assertPosition(position + length - 1)
    return this.bytes.subarray(position, position + length)
  },
  inspectUint8(position_) {
    const position = position_ ?? this.position
    this.assertPosition(position)
    return this.bytes[position]
  },
  inspectUint16(position_) {
    const position = position_ ?? this.position
    this.assertPosition(position + 1)
    return this.dataView.getUint16(position)
  },
  inspectUint24(position_) {
    const position = position_ ?? this.position
    this.assertPosition(position + 2)
    return (
      (this.dataView.getUint16(position) << 8) +
      this.dataView.getUint8(position + 2)
    )
  },
  inspectUint32(position_) {
    const position = position_ ?? this.position
    this.assertPosition(position + 3)
    return this.dataView.getUint32(position)
  },
  pushByte(byte: ByteArray[number]) {
    this.assertPosition(this.position)
    this.bytes[this.position] = byte
    this.position++
  },
  pushBytes(bytes: ByteArray) {
    this.assertPosition(this.position + bytes.length - 1)
    this.bytes.set(bytes, this.position)
    this.position += bytes.length
  },
  pushUint8(value: number) {
    this.assertPosition(this.position)
    this.bytes[this.position] = value
    this.position++
  },
  pushUint16(value: number) {
    this.assertPosition(this.position + 1)
    this.dataView.setUint16(this.position, value)
    this.position += 2
  },
  pushUint24(value: number) {
    this.assertPosition(this.position + 2)
    this.dataView.setUint16(this.position, value >> 8)
    this.dataView.setUint8(this.position + 2, value & ~4294967040)
    this.position += 3
  },
  pushUint32(value: number) {
    this.assertPosition(this.position + 3)
    this.dataView.setUint32(this.position, value)
    this.position += 4
  },
  readByte() {
    const value = this.inspectByte()
    this.position++
    return value
  },
  readBytes(length) {
    const value = this.inspectBytes(length)
    this.position += length
    return value
  },
  readUint8() {
    const value = this.inspectUint8()
    this.position += 1
    return value
  },
  readUint16() {
    const value = this.inspectUint16()
    this.position += 2
    return value
  },
  readUint24() {
    const value = this.inspectUint24()
    this.position += 3
    return value
  },
  readUint32() {
    const value = this.inspectUint32()
    this.position += 4
    return value
  },
  setPosition(position) {
    this.assertPosition(position)
    this.position = position
  },
}

export function createCursor(bytes: ByteArray): Cursor {
  const cursor = Object.create(staticCursor)
  cursor.bytes = bytes
  cursor.dataView = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  )
  return cursor
}
