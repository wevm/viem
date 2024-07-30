import { describe, expect, test } from 'vitest'
import { createCursor } from './cursor.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = i
  return bytes
}

test('default', () => {
  const cursor_1 = createCursor(new Uint8Array([0]))
  expect(cursor_1.bytes).toEqual(new Uint8Array([0]))
  expect(cursor_1.dataView).toEqual(new DataView(new Uint8Array([0]).buffer))
  expect(cursor_1.position).toBe(0)

  const cursor_2 = createCursor(new Uint8Array(generateBytes(420)))
  expect(cursor_2.bytes).toEqual(new Uint8Array(generateBytes(420)))
  expect(cursor_2.dataView).toEqual(
    new DataView(new Uint8Array(generateBytes(420)).buffer),
  )
  expect(cursor_1.position).toBe(0)
})

describe('setPosition', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.setPosition(69)
    expect(cursor.position).toBe(69)
    expect(cursor.inspectByte()).toBe(69)
    cursor.setPosition(79)
    expect(cursor.position).toBe(79)
    expect(cursor.inspectByte()).toBe(79)
    cursor.setPosition(419)
    expect(cursor.position).toBe(419)
    expect(cursor.inspectByte()).toBe(163)
  })

  test('w/ increment/decrement/readByte/readBytes', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))

    cursor.setPosition(69)
    expect(cursor.position).toBe(69)
    expect(cursor.readByte()).toBe(69)
    expect(cursor.position).toBe(70)

    cursor.incrementPosition(10)
    expect(cursor.position).toBe(80)
    expect(cursor.readBytes(10)).toEqual(
      Uint8Array.from([80, 81, 82, 83, 84, 85, 86, 87, 88, 89]),
    )
    expect(cursor.position).toBe(90)

    cursor.decrementPosition(15)
    expect(cursor.position).toBe(75)
    expect(cursor.readUint8()).toEqual(75)
    expect(cursor.position).toBe(76)

    cursor.incrementPosition(25)
    expect(cursor.position).toBe(101)
    expect(cursor.readUint16()).toBe(25958)
    expect(cursor.position).toBe(103)
  })

  test('overflow', () => {
    const cursor_1 = createCursor(new Uint8Array(generateBytes(420)))
    expect(() => cursor_1.setPosition(420)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)

    const cursor_2 = createCursor(new Uint8Array(generateBytes(421)))
    expect(() => cursor_2.setPosition(421)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`421\` is out of bounds (\`0 < position < 421\`).

      Version: viem@x.y.z]
    `)
  })

  test('underflow', () => {
    const cursor_1 = createCursor(new Uint8Array(generateBytes(420)))
    expect(() => cursor_1.setPosition(-1)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`-1\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('incrementPosition', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.incrementPosition(69)
    expect(cursor.inspectByte()).toBe(69)
    expect(cursor.position).toBe(69)
    cursor.incrementPosition(10)
    expect(cursor.inspectByte()).toBe(79)
    expect(cursor.position).toBe(79)
    cursor.incrementPosition(340)
    expect(cursor.inspectByte()).toBe(163)
    expect(cursor.position).toBe(419)
  })

  test('overflow', () => {
    const cursor_1 = createCursor(new Uint8Array(generateBytes(420)))
    expect(() =>
      cursor_1.incrementPosition(420),
    ).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)

    const cursor_2 = createCursor(new Uint8Array(generateBytes(421)))
    expect(() =>
      cursor_2.incrementPosition(421),
    ).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`421\` is out of bounds (\`0 < position < 421\`).

      Version: viem@x.y.z]
    `)
  })

  test('negative', () => {
    const cursor_1 = createCursor(new Uint8Array(generateBytes(420)))
    expect(() =>
      cursor_1.incrementPosition(-1),
    ).toThrowErrorMatchingInlineSnapshot(`
      [NegativeOffsetError: Offset \`-1\` cannot be negative.

      Version: viem@x.y.z]
    `)
  })
})

describe('decrementPosition', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.setPosition(419)
    cursor.decrementPosition(340)
    expect(cursor.inspectByte()).toBe(79)
    expect(cursor.position).toBe(79)
    cursor.decrementPosition(10)
    expect(cursor.inspectByte()).toBe(69)
    expect(cursor.position).toBe(69)
    cursor.decrementPosition(69)
    expect(cursor.inspectByte()).toBe(0)
    expect(cursor.position).toBe(0)
  })

  test('underflow', () => {
    const cursor_1 = createCursor(new Uint8Array(generateBytes(420)))
    expect(() =>
      cursor_1.decrementPosition(1),
    ).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`-1\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })

  test('negative', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.setPosition(419)
    expect(() =>
      cursor.decrementPosition(-1),
    ).toThrowErrorMatchingInlineSnapshot(`
      [NegativeOffsetError: Offset \`-1\` cannot be negative.

      Version: viem@x.y.z]
    `)
  })
})

describe('inspectByte', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.setPosition(419)
    expect(cursor.inspectByte()).toBe(163)
    expect(cursor.position).toBe(419)
    expect(cursor.inspectByte(10)).toBe(10)
    expect(cursor.position).toBe(419)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    expect(() => cursor.inspectByte(420)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('inspectBytes', () => {
  test('default', () => {
    const cursor_1 = createCursor(new Uint8Array(generateBytes(420)))
    cursor_1.setPosition(10)
    expect(cursor_1.inspectBytes(10)).toEqual(
      Uint8Array.from([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]),
    )
    expect(cursor_1.position).toBe(10)

    const cursor_2 = createCursor(new Uint8Array(generateBytes(20)))
    cursor_2.setPosition(10)
    expect(cursor_2.inspectBytes(10)).toEqual(
      Uint8Array.from([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]),
    )
    expect(cursor_2.position).toBe(10)

    const cursor_3 = createCursor(new Uint8Array(generateBytes(20)))
    expect(cursor_3.inspectBytes(10, 10)).toEqual(
      Uint8Array.from([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]),
    )
    expect(cursor_3.position).toBe(0)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.setPosition(415)
    expect(() => cursor.inspectBytes(10)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`424\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)

    const cursor_2 = createCursor(new Uint8Array(generateBytes(20)))
    cursor_2.setPosition(10)
    expect(() => cursor_2.inspectBytes(11)).toThrowErrorMatchingInlineSnapshot(
      `
      [PositionOutOfBoundsError: Position \`20\` is out of bounds (\`0 < position < 20\`).

      Version: viem@x.y.z]
    `,
    )

    const cursor_3 = createCursor(new Uint8Array(generateBytes(20)))
    expect(() =>
      cursor_3.inspectBytes(11, 10),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [PositionOutOfBoundsError: Position \`20\` is out of bounds (\`0 < position < 20\`).

      Version: viem@x.y.z]
    `,
    )
  })
})

describe('inspectUint8', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    expect(cursor.inspectUint8()).toBe(0)
    cursor.setPosition(10)
    expect(cursor.inspectUint8()).toBe(10)
    cursor.setPosition(419)
    expect(cursor.inspectUint8()).toBe(163)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    expect(() => cursor.inspectUint8(420)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('inspectUint16', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 164]))
    expect(cursor.inspectUint16()).toBe(256)
    cursor.incrementPosition(2)
    expect(cursor.inspectUint16()).toBe(420)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 164]))
    expect(cursor.inspectUint16()).toBe(256)
    cursor.incrementPosition(3)
    expect(() => cursor.inspectUint16()).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`4\` is out of bounds (\`0 < position < 4\`).

      Version: viem@x.y.z]
    `)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 164]))
    expect(cursor.inspectUint16()).toBe(256)
    expect(() => cursor.inspectUint16(3)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`4\` is out of bounds (\`0 < position < 4\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('inspectUint24', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 0x0f, 0x2c]))
    expect(cursor.inspectUint24()).toBe(65537)
    cursor.incrementPosition(2)
    expect(cursor.inspectUint24()).toBe(69420)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 0xf2, 0xc0]))
    expect(cursor.inspectUint24()).toBe(65537)
    cursor.incrementPosition(3)
    expect(() => cursor.inspectUint24()).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`5\` is out of bounds (\`0 < position < 5\`).

      Version: viem@x.y.z]
    `)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 0xf2, 0xc0]))
    expect(cursor.inspectUint24()).toBe(65537)
    expect(() => cursor.inspectUint24(3)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`5\` is out of bounds (\`0 < position < 5\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('inspectUint32', () => {
  test('default', () => {
    const cursor = createCursor(
      new Uint8Array([1, 0, 0, 0x29, 0x60, 0xc1, 0xde]),
    )
    expect(cursor.inspectUint32()).toBe(16777257)
    cursor.incrementPosition(3)
    expect(cursor.inspectUint32()).toBe(694206942)
  })

  test('overflow', () => {
    const cursor = createCursor(
      new Uint8Array([1, 0, 0, 0x29, 0x60, 0xc1, 0xde]),
    )
    expect(cursor.inspectUint32()).toBe(16777257)
    cursor.incrementPosition(4)
    expect(() => cursor.inspectUint32()).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`7\` is out of bounds (\`0 < position < 7\`).

      Version: viem@x.y.z]
    `)
  })

  test('overflow', () => {
    const cursor = createCursor(
      new Uint8Array([1, 0, 0, 0x29, 0x60, 0xc1, 0xde]),
    )
    expect(cursor.inspectUint32()).toBe(16777257)
    expect(() => cursor.inspectUint32(4)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`7\` is out of bounds (\`0 < position < 7\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('pushByte', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(420))
    expect(cursor.inspectByte(0)).toBe(0)
    expect(cursor.position).toBe(0)
    cursor.pushByte(69)
    expect(cursor.inspectByte(0)).toBe(69)
    expect(cursor.position).toBe(1)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(420))
    cursor.setPosition(419)
    cursor.pushByte(1)
    expect(() => cursor.pushByte(2)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('pushBytes', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(420))

    expect(cursor.inspectByte(0)).toBe(0)
    expect(cursor.position).toBe(0)

    cursor.pushBytes(Uint8Array.from([69, 420, 69, 420]))
    expect(cursor.inspectBytes(4, 0)).toEqual(
      Uint8Array.from([69, 420, 69, 420]),
    )
    expect(cursor.position).toBe(4)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(420))
    cursor.setPosition(417)
    expect(() =>
      cursor.pushBytes(Uint8Array.from([69, 420, 69, 420])),
    ).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(420))
    cursor.setPosition(416)
    cursor.pushBytes(Uint8Array.from([69]))
    expect(() =>
      cursor.pushBytes(Uint8Array.from([69, 420, 69, 420])),
    ).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('pushUint8', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(420))
    expect(cursor.inspectByte(0)).toBe(0)
    expect(cursor.position).toBe(0)
    cursor.pushUint8(69)
    expect(cursor.inspectUint8(0)).toBe(69)
    expect(cursor.position).toBe(1)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(420))
    cursor.setPosition(419)
    cursor.pushUint8(1)
    expect(() => cursor.pushUint8(2)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('pushUint16', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(420))

    expect(cursor.inspectByte(0)).toBe(0)
    expect(cursor.position).toBe(0)

    cursor.pushUint16(420)
    expect(cursor.inspectUint16(0)).toBe(420)
    expect(cursor.position).toBe(2)

    cursor.pushUint16(256)
    expect(cursor.inspectUint16(2)).toBe(256)
    expect(cursor.position).toBe(4)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(420))
    cursor.setPosition(417)
    cursor.pushUint16(420)
    expect(() => cursor.pushUint16(420)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('pushUint24', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(420))

    expect(cursor.inspectByte(0)).toBe(0)
    expect(cursor.position).toBe(0)

    cursor.pushUint24(69420)
    expect(cursor.inspectUint24(0)).toBe(69420)
    expect(cursor.position).toBe(3)

    cursor.pushUint24(42069)
    expect(cursor.inspectUint24(3)).toBe(42069)
    expect(cursor.position).toBe(6)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(420))
    cursor.setPosition(415)
    cursor.pushUint24(420)
    expect(() => cursor.pushUint24(420)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('pushUint32', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(420))

    expect(cursor.inspectByte(0)).toBe(0)
    expect(cursor.position).toBe(0)

    cursor.pushUint32(42069420)
    expect(cursor.inspectUint32(0)).toBe(42069420)
    expect(cursor.position).toBe(4)

    cursor.pushUint32(694206942)
    expect(cursor.inspectUint32(4)).toBe(694206942)
    expect(cursor.position).toBe(8)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(420))
    cursor.setPosition(413)
    cursor.pushUint32(420)
    expect(() => cursor.pushUint32(420)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('readByte', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    expect(cursor.readByte()).toBe(0)
    expect(cursor.position).toBe(1)
    expect(cursor.readByte()).toBe(1)
    expect(cursor.position).toBe(2)
    cursor.setPosition(69)
    expect(cursor.readByte()).toBe(69)
    expect(cursor.position).toBe(70)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.setPosition(419)
    cursor.readByte()
    expect(() => cursor.readByte()).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('readBytes', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    expect(cursor.readBytes(10)).toEqual(
      Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    )
    expect(cursor.position).toBe(10)

    expect(cursor.readBytes(10)).toEqual(
      Uint8Array.from([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]),
    )
    expect(cursor.position).toBe(20)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.setPosition(415)
    expect(() => cursor.readBytes(10)).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`424\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)

    const cursor_2 = createCursor(new Uint8Array(generateBytes(20)))
    cursor_2.setPosition(10)
    expect(() => cursor_2.readBytes(11)).toThrowErrorMatchingInlineSnapshot(
      `
      [PositionOutOfBoundsError: Position \`20\` is out of bounds (\`0 < position < 20\`).

      Version: viem@x.y.z]
    `,
    )
  })
})

describe('readUint8', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    expect(cursor.readUint8()).toBe(0)
    expect(cursor.readUint8()).toBe(1)
    cursor.setPosition(10)
    expect(cursor.readUint8()).toBe(10)
    expect(cursor.readUint8()).toBe(11)
    cursor.setPosition(418)
    expect(cursor.readUint8()).toBe(162)
    expect(cursor.readUint8()).toBe(163)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)))
    cursor.setPosition(419)
    cursor.readUint8()
    expect(() => cursor.readUint8()).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`420\` is out of bounds (\`0 < position < 420\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('readUint16', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 164]))
    expect(cursor.readUint16()).toBe(256)
    expect(cursor.readUint16()).toBe(420)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 164]))
    expect(cursor.readUint16()).toBe(256)
    expect(cursor.readUint16()).toBe(420)
    expect(() => cursor.readUint16()).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`5\` is out of bounds (\`0 < position < 4\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('readUint24', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 33, 24, 33]))
    expect(cursor.readUint24()).toBe(65537)
    expect(cursor.readUint24()).toBe(2168865)
  })

  test('overflow', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 1, 0xf2, 0xc0]))
    expect(cursor.readUint24()).toBe(65537)
    expect(() => cursor.readUint24()).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`5\` is out of bounds (\`0 < position < 5\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('readUint32', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array([1, 0, 0, 33, 64, 100, 99, 102]))
    expect(cursor.readUint32()).toBe(16777249)
    expect(cursor.readUint32()).toBe(1080320870)
  })

  test('overflow', () => {
    const cursor = createCursor(
      new Uint8Array([1, 0, 0, 0x29, 0x60, 0xc1, 0xde]),
    )
    expect(cursor.readUint32()).toBe(16777257)
    expect(() => cursor.readUint32()).toThrowErrorMatchingInlineSnapshot(`
      [PositionOutOfBoundsError: Position \`7\` is out of bounds (\`0 < position < 7\`).

      Version: viem@x.y.z]
    `)
  })
})

describe('args: recursiveReadLimit', () => {
  test('default', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)), {
      recursiveReadLimit: Number.POSITIVE_INFINITY,
    })

    cursor.readBytes(10)
    cursor.setPosition(0)
    cursor.readBytes(10)
    cursor.setPosition(0)
    cursor.readBytes(10)
    cursor.setPosition(0)
    cursor.readBytes(10)
    cursor.setPosition(0)
    cursor.readBytes(10)
    cursor.setPosition(0)
    cursor.readBytes(10)
    cursor.setPosition(0)
  })

  test('=== 2', () => {
    const cursor = createCursor(new Uint8Array(generateBytes(420)), {
      recursiveReadLimit: 2,
    })

    cursor.readBytes(10)
    cursor.setPosition(0)
    cursor.readBytes(10)
    cursor.setPosition(0)
    cursor.readBytes(10)
    cursor.setPosition(20)
    expect(() => cursor.readBytes(10)).toThrowErrorMatchingInlineSnapshot(`
      [RecursiveReadLimitExceededError: Recursive read limit of \`2\` exceeded (recursive read count: \`3\`).

      Version: viem@x.y.z]
    `)
  })
})
