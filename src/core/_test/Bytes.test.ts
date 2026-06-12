import { describe, expect, test } from 'vitest'

import * as Bytes from '../Bytes.js'

describe('concat', () => {
  test('default', () => {
    expect(
      Bytes.concat(new Uint8Array([0]), new Uint8Array([1])),
    ).toStrictEqual(new Uint8Array([0, 1]))
    expect(
      Bytes.concat(
        new Uint8Array([1]),
        new Uint8Array([69]),
        new Uint8Array([420, 69]),
      ),
    ).toStrictEqual(new Uint8Array([1, 69, 420, 69]))
    expect(
      Bytes.concat(
        new Uint8Array([0, 0, 0, 1]),
        new Uint8Array([0, 0, 0, 69]),
        new Uint8Array([0, 0, 420, 69]),
      ),
    ).toStrictEqual(new Uint8Array([0, 0, 0, 1, 0, 0, 0, 69, 0, 0, 420, 69]))
  })
})

describe('fromBoolean', () => {
  test('default', () => {
    expect(Bytes.fromBoolean(true)).toStrictEqual(new Uint8Array([1]))
    expect(Bytes.fromBoolean(false)).toStrictEqual(new Uint8Array([0]))
  })

  test('args: size', () => {
    expect(Bytes.fromBoolean(true, { size: 16 })).toStrictEqual(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]),
    )
    expect(Bytes.fromBoolean(true, { size: 32 })).toStrictEqual(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 1,
      ]),
    )
    expect(Bytes.fromBoolean(false, { size: 16 })).toStrictEqual(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    )
    expect(Bytes.fromBoolean(false, { size: 32 })).toStrictEqual(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      Bytes.fromBoolean(true, { size: 0 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeOverflowError: Size cannot exceed \`0\` bytes. Given size: \`1\` bytes.]`,
    )
    expect(() =>
      Bytes.fromBoolean(false, { size: 0 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeOverflowError: Size cannot exceed \`0\` bytes. Given size: \`1\` bytes.]`,
    )
  })
})

describe('fromHex', () => {
  test('default', () => {
    expect(Bytes.fromHex('0x')).toStrictEqual(new Uint8Array([]))
    expect(Bytes.fromHex('0x61')).toStrictEqual(new Uint8Array([97]))
    expect(Bytes.fromHex('0x616263')).toStrictEqual(
      new Uint8Array([97, 98, 99]),
    )
    expect(Bytes.fromHex('0x48656c6c6f20576f726c6421')).toStrictEqual(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
    expect(
      Bytes.fromHex('0x048656c6c620576f726c6421ABCDEFabcdef'),
    ).toStrictEqual(
      new Uint8Array([
        4, 134, 86, 198, 198, 32, 87, 111, 114, 108, 100, 33, 171, 205, 239,
        171, 205, 239,
      ]),
    )
  })

  test('args: size', () => {
    expect(
      Bytes.fromHex('0x48656c6c6f20576f726c6421', { size: 16 }),
    ).toStrictEqual(
      new Uint8Array([
        72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0,
      ]),
    )
    expect(
      Bytes.fromHex('0x48656c6c6f20576f726c6421', { size: 32 }),
    ).toStrictEqual(
      new Uint8Array([
        72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      Bytes.fromHex('0x48656c6c6f20576f726c6421', { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`8\` bytes. Given size: \`12\` bytes.]`,
    )
  })

  test('error: invalid hex', () => {
    expect(() => Bytes.fromHex('0xabcdefgh'))
      .toThrowErrorMatchingInlineSnapshot(`
      [Hex.InvalidHexValueError: Value \`0xabcdefgh\` is an invalid hex value.

      Hex values must start with \`"0x"\` and contain only hexadecimal characters (0-9, a-f, A-F).]
    `)
  })

  test('error: odd-length hex', () => {
    expect(() => Bytes.fromHex('0x48656c6c620576f726c6421ABCDEFabcdef'))
      .toThrowErrorMatchingInlineSnapshot(`
      [Hex.InvalidLengthError: Hex value \`"0x48656c6c620576f726c6421ABCDEFabcdef"\` is an odd length (35 nibbles).

      It must be an even length.]
    `)
  })
})

describe('fromNumber', () => {
  test('default', () => {
    expect(Bytes.fromNumber(0)).toStrictEqual(new Uint8Array([0]))
    expect(Bytes.fromNumber(7)).toStrictEqual(new Uint8Array([7]))
    expect(Bytes.fromNumber(69)).toStrictEqual(new Uint8Array([69]))
    expect(Bytes.fromNumber(420)).toStrictEqual(new Uint8Array([1, 164]))

    expect(() => Bytes.fromNumber(-69)).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`-69\` is not in safe unsigned integer range (\`0\` to \`9007199254740991\`)]`,
    )
  })

  test('args: size', () => {
    expect(Bytes.fromNumber(7, { size: 1 })).toStrictEqual(new Uint8Array([7]))
    expect(Bytes.fromNumber(10, { size: 2 })).toStrictEqual(
      new Uint8Array([0, 10]),
    )
    expect(Bytes.fromNumber(69420, { size: 4 })).toStrictEqual(
      new Uint8Array([0, 1, 15, 44]),
    )
    expect(Bytes.fromNumber(69420, { size: 32 })).toStrictEqual(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 1, 15, 44,
      ]),
    )

    expect(() =>
      Bytes.fromNumber(-7, { size: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`-7\` is not in safe 8-bit unsigned integer range (\`0\` to \`255\`)]`,
    )
    expect(() =>
      Bytes.fromNumber(256, { size: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`256\` is not in safe 8-bit unsigned integer range (\`0\` to \`255\`)]`,
    )
    expect(() =>
      Bytes.fromNumber(65536, { size: 2 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`65536\` is not in safe 16-bit unsigned integer range (\`0\` to \`65535\`)]`,
    )
  })

  test('args: signed', () => {
    expect(Bytes.fromNumber(32, { size: 1, signed: true })).toStrictEqual(
      new Uint8Array([32]),
    )
    expect(Bytes.fromNumber(-32, { size: 1, signed: true })).toStrictEqual(
      new Uint8Array([224]),
    )
    expect(Bytes.fromNumber(-32, { size: 4, signed: true })).toStrictEqual(
      new Uint8Array([255, 255, 255, 224]),
    )

    expect(Bytes.fromNumber(127, { size: 2, signed: true })).toStrictEqual(
      new Uint8Array([0, 127]),
    )
    expect(Bytes.fromNumber(-127, { size: 2, signed: true })).toStrictEqual(
      new Uint8Array([255, 129]),
    )
    expect(Bytes.fromNumber(32767, { size: 2, signed: true })).toStrictEqual(
      new Uint8Array([127, 255]),
    )
    expect(Bytes.fromNumber(-32768, { size: 2, signed: true })).toStrictEqual(
      new Uint8Array([128, 0]),
    )

    expect(() =>
      Bytes.fromNumber(32768, { size: 2, signed: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`32768\` is not in safe 16-bit signed integer range (\`-32768\` to \`32767\`)]`,
    )
    expect(() =>
      Bytes.fromNumber(-32769, { size: 2, signed: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`-32769\` is not in safe 16-bit signed integer range (\`-32768\` to \`32767\`)]`,
    )
  })

  test('default (bigint)', () => {
    expect(Bytes.fromNumber(0n)).toStrictEqual(new Uint8Array([0]))
    expect(Bytes.fromNumber(7n)).toStrictEqual(new Uint8Array([7]))
    expect(Bytes.fromNumber(69n)).toStrictEqual(new Uint8Array([69]))
    expect(Bytes.fromNumber(420n)).toStrictEqual(new Uint8Array([1, 164]))
    expect(
      Bytes.fromNumber(4206942069420694206942069420694206942069n),
    ).toStrictEqual(
      new Uint8Array([
        12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252, 11,
        117,
      ]),
    )
  })

  test('args: size (bigint)', () => {
    expect(Bytes.fromNumber(7n, { size: 1 })).toStrictEqual(new Uint8Array([7]))
    expect(Bytes.fromNumber(10n, { size: 2 })).toStrictEqual(
      new Uint8Array([0, 10]),
    )
    expect(Bytes.fromNumber(69n, { size: 4 })).toStrictEqual(
      new Uint8Array([0, 0, 0, 69]),
    )
    expect(
      Bytes.fromNumber(6123123124124124213123129n, { size: 32 }),
    ).toStrictEqual(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 16,
        159, 43, 112, 14, 48, 229, 179, 152, 57,
      ]),
    )

    expect(() =>
      Bytes.fromNumber(-7n, { size: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`-7n\` is not in safe 8-bit unsigned integer range (\`0n\` to \`255n\`)]`,
    )
    expect(() =>
      Bytes.fromNumber(256n, { size: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`256n\` is not in safe 8-bit unsigned integer range (\`0n\` to \`255n\`)]`,
    )
    expect(() =>
      Bytes.fromNumber(65536n, { size: 2 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`65536n\` is not in safe 16-bit unsigned integer range (\`0n\` to \`65535n\`)]`,
    )
    expect(() =>
      Bytes.fromNumber(18446744073709551616n, { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`18446744073709551616n\` is not in safe 64-bit unsigned integer range (\`0n\` to \`18446744073709551615n\`)]`,
    )
  })

  test('args: signed (bigint)', () => {
    expect(Bytes.fromNumber(32n, { size: 1, signed: true })).toStrictEqual(
      new Uint8Array([32]),
    )
    expect(Bytes.fromNumber(-32n, { size: 1, signed: true })).toStrictEqual(
      new Uint8Array([224]),
    )
    expect(Bytes.fromNumber(-32n, { size: 4, signed: true })).toStrictEqual(
      new Uint8Array([255, 255, 255, 224]),
    )

    expect(Bytes.fromNumber(127n, { size: 2, signed: true })).toStrictEqual(
      new Uint8Array([0, 127]),
    )
    expect(Bytes.fromNumber(-127n, { size: 2, signed: true })).toStrictEqual(
      new Uint8Array([255, 129]),
    )
    expect(Bytes.fromNumber(32767n, { size: 2, signed: true })).toStrictEqual(
      new Uint8Array([127, 255]),
    )
    expect(Bytes.fromNumber(-32768n, { size: 2, signed: true })).toStrictEqual(
      new Uint8Array([128, 0]),
    )

    expect(
      Bytes.fromNumber(12312312312312312412n, { size: 32, signed: true }),
    ).toStrictEqual(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        170, 222, 30, 208, 139, 11, 50, 92,
      ]),
    )
    expect(
      Bytes.fromNumber(-12312312312312312412n, { size: 32, signed: true }),
    ).toStrictEqual(
      new Uint8Array([
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 85, 33, 225, 47, 116,
        244, 205, 164,
      ]),
    )

    expect(() =>
      Bytes.fromNumber(170141183460469231731687303715884105728n, {
        size: 16,
        signed: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`170141183460469231731687303715884105728n\` is not in safe 128-bit signed integer range (\`-170141183460469231731687303715884105728n\` to \`170141183460469231731687303715884105727n\`)]`,
    )
    expect(() =>
      Bytes.fromNumber(-170141183460469231731687303715884105729n, {
        size: 16,
        signed: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.IntegerOutOfRangeError: Number \`-170141183460469231731687303715884105729n\` is not in safe 128-bit signed integer range (\`-170141183460469231731687303715884105728n\` to \`170141183460469231731687303715884105727n\`)]`,
    )
  })
})

describe('fromString', () => {
  test('default', () => {
    expect(Bytes.fromString('')).toStrictEqual(new Uint8Array([]))
    expect(Bytes.fromString('a')).toStrictEqual(new Uint8Array([97]))
    expect(Bytes.fromString('abc')).toStrictEqual(new Uint8Array([97, 98, 99]))
    expect(Bytes.fromString('Hello World!')).toStrictEqual(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    )
    // multibyte unicode
    expect(Bytes.fromString('wagmi 🥵')).toStrictEqual(
      new Uint8Array([119, 97, 103, 109, 105, 32, 240, 159, 165, 181]),
    )
  })

  test('args: size', () => {
    expect(Bytes.fromString('Hello World!', { size: 16 })).toStrictEqual(
      new Uint8Array([
        72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0,
      ]),
    )
    expect(Bytes.fromString('Hello World!', { size: 32 })).toStrictEqual(
      new Uint8Array([
        72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      Bytes.fromString('Hello World!', { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeOverflowError: Size cannot exceed \`8\` bytes. Given size: \`12\` bytes.]`,
    )
  })
})

describe('padLeft', () => {
  test('default', () => {
    expect(Bytes.padLeft(new Uint8Array([1]))).toStrictEqual(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 1,
      ]),
    )
    expect(Bytes.padLeft(new Uint8Array([1, 122, 51, 123]))).toStrictEqual(
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 1, 122, 51, 123,
      ]),
    )
  })

  test('args: size', () => {
    expect(Bytes.padLeft(new Uint8Array([1]), 4)).toStrictEqual(
      new Uint8Array([0, 0, 0, 1]),
    )
    expect(Bytes.padLeft(new Uint8Array([1, 122, 51, 123]), 4)).toStrictEqual(
      new Uint8Array([1, 122, 51, 123]),
    )
    expect(
      Bytes.padLeft(new Uint8Array([1, 122, 51, 123, 11, 23]), 0),
    ).toStrictEqual(new Uint8Array([1, 122, 51, 123, 11, 23]))
  })

  test('error: size exceeds padding size', () => {
    expect(() =>
      Bytes.padLeft(
        new Uint8Array([
          1, 122, 51, 123, 1, 122, 51, 123, 1, 122, 51, 123, 1, 122, 51, 123, 1,
          122, 51, 123, 1, 122, 51, 123, 1, 122, 51, 123, 1, 122, 51, 123, 1,
          122, 51, 123, 1, 122, 51, 123, 1, 122, 51, 123,
        ]),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeExceedsPaddingSizeError: Bytes size (\`44\`) exceeds padding size (\`32\`).]`,
    )
    expect(() =>
      Bytes.padLeft(new Uint8Array([1, 122, 51, 123, 11]), 4),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeExceedsPaddingSizeError: Bytes size (\`5\`) exceeds padding size (\`4\`).]`,
    )
  })
})

describe('padRight', () => {
  test('default', () => {
    expect(Bytes.padRight(new Uint8Array([1]))).toStrictEqual(
      new Uint8Array([
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    )
    expect(Bytes.padRight(new Uint8Array([1, 122, 51, 123]))).toStrictEqual(
      new Uint8Array([
        1, 122, 51, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    )
    expect(Bytes.padRight(new Uint8Array([1, 122, 51, 123, 11]))).toStrictEqual(
      new Uint8Array([
        1, 122, 51, 123, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    )
  })
})

describe('size', () => {
  test('default', () => {
    expect(Bytes.size(new Uint8Array([]))).toBe(0)
    expect(Bytes.size(new Uint8Array([1]))).toBe(1)
    expect(Bytes.size(new Uint8Array([1, 2]))).toBe(2)
    expect(Bytes.size(new Uint8Array([1, 2, 3, 4]))).toBe(4)
  })
})

describe('slice', () => {
  test('default', () => {
    expect(Bytes.slice(new Uint8Array([]))).toStrictEqual(new Uint8Array([]))
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])),
    ).toStrictEqual(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))

    expect(Bytes.slice(new Uint8Array([]), 0)).toStrictEqual(new Uint8Array([]))
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 4),
    ).toStrictEqual(new Uint8Array([0, 1, 2, 3]))
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 8),
    ).toStrictEqual(new Uint8Array([2, 3, 4, 5, 6, 7]))
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 5, 9),
    ).toStrictEqual(new Uint8Array([5, 6, 7, 8]))
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 2),
    ).toStrictEqual(new Uint8Array([2, 3, 4, 5, 6, 7, 8, 9]))
  })

  test('args: negative offsets', () => {
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), -1),
    ).toStrictEqual(new Uint8Array([9]))
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), -3, -1),
    ).toStrictEqual(new Uint8Array([7, 8]))
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), -8),
    ).toStrictEqual(new Uint8Array([2, 3, 4, 5, 6, 7, 8, 9]))
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), -10),
    ).toStrictEqual(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
  })

  test('args: out-of-bounds end (non-strict)', () => {
    expect(
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 10),
    ).toStrictEqual(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
  })

  test('error: slice offset out-of-bounds', () => {
    expect(() =>
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 10),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SliceOffsetOutOfBoundsError: Slice starting at offset \`10\` is out-of-bounds (size: \`10\`).]`,
    )

    expect(() =>
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 0, 11, {
        strict: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SliceOffsetOutOfBoundsError: Slice ending at offset \`11\` is out-of-bounds (size: \`10\`).]`,
    )
    expect(() =>
      Bytes.slice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 5, 15, {
        strict: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SliceOffsetOutOfBoundsError: Slice ending at offset \`15\` is out-of-bounds (size: \`5\`).]`,
    )
  })
})

describe('toBigInt', () => {
  test('default', () => {
    expect(Bytes.toBigInt(new Uint8Array([0]))).toBe(0n)
    expect(Bytes.toBigInt(new Uint8Array([7]))).toBe(7n)
    expect(Bytes.toBigInt(new Uint8Array([69]))).toBe(69n)
    expect(Bytes.toBigInt(new Uint8Array([1, 164]))).toBe(420n)
    expect(
      Bytes.toBigInt(
        new Uint8Array([
          12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252,
          11, 117,
        ]),
      ),
    ).toBe(4206942069420694206942069420694206942069n)
  })

  test('args: size', () => {
    expect(
      Bytes.toBigInt(Bytes.fromNumber(420n, { size: 32 }), { size: 32 }),
    ).toBe(420n)
  })

  test('error: size overflow', () => {
    expect(() =>
      Bytes.toBigInt(Bytes.fromNumber(69420, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })
})

describe('toBoolean', () => {
  test('default', () => {
    expect(Bytes.toBoolean(new Uint8Array([0]))).toBe(false)
    expect(Bytes.toBoolean(new Uint8Array([1]))).toBe(true)
  })

  test('args: size', () => {
    expect(
      Bytes.toBoolean(Bytes.fromBoolean(true, { size: 32 }), { size: 32 }),
    ).toBe(true)
  })

  test('error: size overflow', () => {
    expect(() =>
      Bytes.toBoolean(Bytes.fromBoolean(true, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })

  test('error: invalid boolean', () => {
    expect(() => Bytes.toBoolean(new Uint8Array([69])))
      .toThrowErrorMatchingInlineSnapshot(`
      [Bytes.InvalidBytesBooleanError: Bytes value \`69\` is not a valid boolean.

      The bytes array must contain a single byte of either a \`0\` or \`1\` value.]
    `)
    expect(() => Bytes.toBoolean(new Uint8Array([1, 2])))
      .toThrowErrorMatchingInlineSnapshot(`
      [Bytes.InvalidBytesBooleanError: Bytes value \`1,2\` is not a valid boolean.

      The bytes array must contain a single byte of either a \`0\` or \`1\` value.]
    `)
  })
})

describe('toHex', () => {
  test('default', () => {
    expect(Bytes.toHex(new Uint8Array([97]))).toBe('0x61')
    expect(Bytes.toHex(new Uint8Array([97, 98, 99]))).toBe('0x616263')
    expect(
      Bytes.toHex(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
      ),
    ).toBe('0x48656c6c6f20576f726c6421')
  })

  test('args: size', () => {
    expect(
      Bytes.toHex(Bytes.fromHex('0x420696', { size: 32 }), { size: 32 }),
    ).toBe('0x4206960000000000000000000000000000000000000000000000000000000000')
  })

  test('error: size overflow', () => {
    expect(() =>
      Bytes.toHex(Bytes.fromHex('0x420696', { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Hex.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })
})

describe('toNumber', () => {
  test('default', () => {
    expect(Bytes.toNumber(new Uint8Array([0]))).toBe(0)
    expect(Bytes.toNumber(new Uint8Array([7]))).toBe(7)
    expect(Bytes.toNumber(new Uint8Array([69]))).toBe(69)
    expect(Bytes.toNumber(new Uint8Array([1, 164]))).toBe(420)
  })

  test('args: size', () => {
    expect(
      Bytes.toNumber(Bytes.fromNumber(420, { size: 32 }), { size: 32 }),
    ).toBe(420)
  })

  test('error: size overflow', () => {
    expect(() =>
      Bytes.toNumber(Bytes.fromNumber(69420, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })
})

describe('toString', () => {
  test('default', () => {
    expect(Bytes.toString(new Uint8Array([]))).toBe('')
    expect(Bytes.toString(new Uint8Array([97]))).toBe('a')
    expect(Bytes.toString(new Uint8Array([97, 98, 99]))).toBe('abc')
    expect(
      Bytes.toString(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
      ),
    ).toBe('Hello World!')
    // multibyte unicode
    expect(Bytes.toString(Bytes.fromString('wagmi 🥵'))).toBe('wagmi 🥵')
  })

  test('args: size', () => {
    expect(
      Bytes.toString(Bytes.fromString('wagmi', { size: 32 }), { size: 32 }),
    ).toBe('wagmi')
  })

  test('error: size overflow', () => {
    expect(() =>
      Bytes.toString(Bytes.fromString('wagmi', { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Bytes.SizeOverflowError: Size cannot exceed \`32\` bytes. Given size: \`64\` bytes.]`,
    )
  })
})

describe('trimLeft', () => {
  test('default', () => {
    expect(Bytes.trimLeft(new Uint8Array([0, 0, 0, 0, 0]))).toStrictEqual(
      new Uint8Array([]),
    )

    expect(
      Bytes.trimLeft(
        new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 1,
        ]),
      ),
    ).toStrictEqual(new Uint8Array([1]))

    expect(
      Bytes.trimLeft(
        new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 122, 51, 123,
        ]),
      ),
    ).toStrictEqual(new Uint8Array([1, 122, 51, 123]))
  })
})

describe('trimRight', () => {
  test('default', () => {
    expect(
      Bytes.trimRight(
        new Uint8Array([
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]),
      ),
    ).toStrictEqual(new Uint8Array([1]))

    expect(
      Bytes.trimRight(
        new Uint8Array([
          1, 122, 51, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]),
      ),
    ).toStrictEqual(new Uint8Array([1, 122, 51, 123]))

    expect(
      Bytes.trimRight(
        new Uint8Array([
          1, 122, 51, 123, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ]),
      ),
    ).toStrictEqual(new Uint8Array([1, 122, 51, 123, 11]))
  })
})

describe('validate', () => {
  test('default', () => {
    expect(Bytes.validate(new Uint8Array([1, 69, 420]))).toBe(true)
    expect(Bytes.validate('0x1')).toBe(false)
    expect(Bytes.validate({})).toBe(false)
    expect(Bytes.validate(undefined)).toBe(false)
  })
})
