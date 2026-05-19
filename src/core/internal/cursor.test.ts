import { describe, expect, test } from 'vp/test'

import {
  NegativeOffsetError,
  PositionOutOfBoundsError,
  RecursiveReadLimitExceededError,
  createCursor,
} from './cursor.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let index = 0; index < length; index++) bytes[index] = index
  return bytes
}

describe('createCursor', () => {
  test('behavior: creates cursor state over bytes', () => {
    const cursor = createCursor(generateBytes(4))

    expect({
      bytes: Array.from(cursor.bytes),
      position: cursor.position,
      remaining: cursor.remaining,
    }).toMatchInlineSnapshot(`
      {
        "bytes": [
          0,
          1,
          2,
          3,
        ],
        "position": 0,
        "remaining": 4,
      }
    `)
  })
})

describe('setPosition', () => {
  test('behavior: moves and restores position', () => {
    const cursor = createCursor(generateBytes(8))
    const restore = cursor.setPosition(4)

    expect({
      byte: cursor.inspectByte(),
      position: cursor.position,
    }).toMatchInlineSnapshot(`
      {
        "byte": 4,
        "position": 4,
      }
    `)

    restore()
    expect(cursor.position).toMatchInlineSnapshot(`0`)
  })
})

describe('incrementPosition', () => {
  test('behavior: increments position', () => {
    const cursor = createCursor(generateBytes(8))
    cursor.incrementPosition(3)

    expect({
      byte: cursor.inspectByte(),
      position: cursor.position,
    }).toMatchInlineSnapshot(`
      {
        "byte": 3,
        "position": 3,
      }
    `)
  })
})

describe('decrementPosition', () => {
  test('behavior: decrements position', () => {
    const cursor = createCursor(generateBytes(8))
    cursor.setPosition(7)
    cursor.decrementPosition(4)

    expect({
      byte: cursor.inspectByte(),
      position: cursor.position,
    }).toMatchInlineSnapshot(`
      {
        "byte": 3,
        "position": 3,
      }
    `)
  })
})

describe('inspectBytes', () => {
  test('behavior: reads bytes without moving position', () => {
    const cursor = createCursor(generateBytes(8))
    cursor.setPosition(2)

    expect({
      bytes: Array.from(cursor.inspectBytes(3)),
      position: cursor.position,
    }).toMatchInlineSnapshot(`
      {
        "bytes": [
          2,
          3,
          4,
        ],
        "position": 2,
      }
    `)
  })
})

describe('readBytes', () => {
  test('behavior: reads bytes and advances by size override', () => {
    const cursor = createCursor(generateBytes(8))

    expect({
      bytes: Array.from(cursor.readBytes(3, 5)),
      position: cursor.position,
      remaining: cursor.remaining,
    }).toMatchInlineSnapshot(`
      {
        "bytes": [
          0,
          1,
          2,
        ],
        "position": 5,
        "remaining": 3,
      }
    `)
  })
})

describe('uint methods', () => {
  test('behavior: inspects and reads unsigned integers', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 0x0f, 0x2c]))

    expect({
      uint8: cursor.readUint8(),
      uint16: cursor.readUint16(),
      uint24: cursor.inspectUint24(2),
      position: cursor.position,
    }).toMatchInlineSnapshot(`
      {
        "position": 3,
        "uint16": 1,
        "uint24": 69420,
        "uint8": 1,
      }
    `)
  })

  test('behavior: pushes unsigned integers', () => {
    const cursor = createCursor(new Uint8Array(10))
    cursor.pushUint8(1)
    cursor.pushUint16(420)
    cursor.pushUint24(69420)
    cursor.pushUint32(42069420)

    expect({
      bytes: Array.from(cursor.bytes),
      position: cursor.position,
    }).toMatchInlineSnapshot(`
      {
        "bytes": [
          1,
          1,
          164,
          1,
          15,
          44,
          2,
          129,
          237,
          172,
        ],
        "position": 10,
      }
    `)
  })
})

describe('pushBytes', () => {
  test('behavior: writes bytes and advances position', () => {
    const cursor = createCursor(new Uint8Array(4))
    cursor.pushBytes(Uint8Array.from([1, 2, 3]))

    expect({
      bytes: Array.from(cursor.bytes),
      position: cursor.position,
    }).toMatchInlineSnapshot(`
      {
        "bytes": [
          1,
          2,
          3,
          0,
        ],
        "position": 3,
      }
    `)
  })
})

describe('PositionOutOfBoundsError', () => {
  test('error: throws for out-of-bounds positions', () => {
    const cursor = createCursor(generateBytes(4))

    expect(() => cursor.setPosition(4)).toThrow(PositionOutOfBoundsError)
  })
})

describe('NegativeOffsetError', () => {
  test('error: throws for negative offsets', () => {
    const cursor = createCursor(generateBytes(4))

    expect(() => cursor.incrementPosition(-1)).toThrow(NegativeOffsetError)
  })
})

describe('RecursiveReadLimitExceededError', () => {
  test('error: throws when recursive reads exceed the limit', () => {
    const cursor = createCursor(generateBytes(4), { recursiveReadLimit: 1 })

    cursor.readByte()
    cursor.setPosition(0)
    cursor.readByte()
    cursor.setPosition(0)

    expect(() => cursor.readByte()).toThrow(RecursiveReadLimitExceededError)
  })
})
