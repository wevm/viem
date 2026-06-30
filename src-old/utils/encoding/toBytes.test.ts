import { describe, expect, test } from 'vitest'

import {
  boolToBytes,
  hexToBytes,
  numberToBytes,
  stringToBytes,
  toBytes,
} from './toBytes.js'

describe('converts numbers to bytes', () => {
  test('default', () => {
    expect(toBytes(0)).toMatchInlineSnapshot(`
      Uint8Array [
        0,
      ]
    `)
    expect(toBytes(7)).toMatchInlineSnapshot(`
      Uint8Array [
        7,
      ]
    `)
    expect(toBytes(69)).toMatchInlineSnapshot(`
      Uint8Array [
        69,
      ]
    `)
    expect(toBytes(420)).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        164,
      ]
    `)

    expect(numberToBytes(0)).toMatchInlineSnapshot(`
      Uint8Array [
        0,
      ]
    `)
    expect(numberToBytes(7)).toMatchInlineSnapshot(`
      Uint8Array [
        7,
      ]
    `)
    expect(numberToBytes(69)).toMatchInlineSnapshot(`
      Uint8Array [
        69,
      ]
    `)
    expect(numberToBytes(420)).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        164,
      ]
    `)

    expect(() => toBytes(-69)).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "-69" is not in safe integer range (0 to 9007199254740991)

      Version: viem@x.y.z]
    `,
    )
  })

  test('args: size', () => {
    expect(numberToBytes(7, { size: 1 })).toMatchInlineSnapshot(`
      Uint8Array [
        7,
      ]
    `)
    expect(numberToBytes(10, { size: 2 })).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        10,
      ]
    `)
    expect(numberToBytes(69420, { size: 4 })).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        1,
        15,
        44,
      ]
    `)
    expect(numberToBytes(69420, { size: 32 })).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        15,
        44,
      ]
    `)

    expect(() =>
      numberToBytes(-7, { size: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "-7" is not in safe 8-bit unsigned integer range (0 to 255)

      Version: viem@x.y.z]
    `,
    )
    expect(() =>
      numberToBytes(256, { size: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "256" is not in safe 8-bit unsigned integer range (0 to 255)

      Version: viem@x.y.z]
    `,
    )
    expect(() =>
      numberToBytes(65536, { size: 2 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "65536" is not in safe 16-bit unsigned integer range (0 to 65535)

      Version: viem@x.y.z]
    `,
    )
  })

  test('args: signed', () => {
    expect(numberToBytes(32, { size: 1, signed: true })).toMatchInlineSnapshot(
      `
      Uint8Array [
        32,
      ]
    `,
    )
    expect(
      numberToBytes(-32, {
        size: 1,
        signed: true,
      }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        224,
      ]
    `)
    expect(
      numberToBytes(-32, {
        size: 4,
        signed: true,
      }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        255,
        255,
        255,
        224,
      ]
    `)

    expect(numberToBytes(127, { size: 2, signed: true })).toMatchInlineSnapshot(
      `
      Uint8Array [
        0,
        127,
      ]
    `,
    )
    expect(
      numberToBytes(-127, { size: 2, signed: true }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        255,
        129,
      ]
    `)
    expect(
      numberToBytes(32767, { size: 2, signed: true }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        127,
        255,
      ]
    `)
    expect(
      numberToBytes(-32768, { size: 2, signed: true }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        128,
        0,
      ]
    `)
    expect(() =>
      numberToBytes(32768, { size: 2, signed: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "32768" is not in safe 16-bit signed integer range (-32768 to 32767)

      Version: viem@x.y.z]
    `,
    )
    expect(() =>
      numberToBytes(-32769, { size: 2, signed: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "-32769" is not in safe 16-bit signed integer range (-32768 to 32767)

      Version: viem@x.y.z]
    `,
    )
  })
})

describe('converts bigints to bytes', () => {
  test('default', () => {
    expect(toBytes(0n)).toMatchInlineSnapshot(`
      Uint8Array [
        0,
      ]
    `)
    expect(toBytes(7n)).toMatchInlineSnapshot(`
      Uint8Array [
        7,
      ]
    `)
    expect(toBytes(69n)).toMatchInlineSnapshot(`
      Uint8Array [
        69,
      ]
    `)
    expect(toBytes(420n)).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        164,
      ]
    `)
    expect(
      toBytes(4206942069420694206942069420694206942069n),
    ).toMatchInlineSnapshot(`
        Uint8Array [
          12,
          92,
          243,
          146,
          17,
          135,
          111,
          181,
          229,
          136,
          67,
          39,
          250,
          86,
          252,
          11,
          117,
        ]
      `)

    expect(numberToBytes(0)).toMatchInlineSnapshot(`
      Uint8Array [
        0,
      ]
    `)
    expect(numberToBytes(7n)).toMatchInlineSnapshot(`
      Uint8Array [
        7,
      ]
    `)
    expect(numberToBytes(69n)).toMatchInlineSnapshot(`
      Uint8Array [
        69,
      ]
    `)
    expect(numberToBytes(420n)).toMatchInlineSnapshot(`
      Uint8Array [
        1,
        164,
      ]
    `)
    expect(
      numberToBytes(4206942069420694206942069420694206942069n),
    ).toMatchInlineSnapshot(`
        Uint8Array [
          12,
          92,
          243,
          146,
          17,
          135,
          111,
          181,
          229,
          136,
          67,
          39,
          250,
          86,
          252,
          11,
          117,
        ]
      `)
  })

  test('args: size', () => {
    expect(numberToBytes(7n, { size: 1 })).toMatchInlineSnapshot(`
      Uint8Array [
        7,
      ]
    `)
    expect(numberToBytes(10n, { size: 2 })).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        10,
      ]
    `)
    expect(numberToBytes(69n, { size: 4 })).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        0,
        0,
        69,
      ]
    `)
    expect(
      numberToBytes(6123123124124124213123129n, { size: 32 }),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        16,
        159,
        43,
        112,
        14,
        48,
        229,
        179,
        152,
        57,
      ]
    `,
    )

    expect(() =>
      numberToBytes(-7n, { size: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "-7n" is not in safe 8-bit unsigned integer range (0n to 255n)

      Version: viem@x.y.z]
    `,
    )
    expect(() =>
      numberToBytes(256n, { size: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "256n" is not in safe 8-bit unsigned integer range (0n to 255n)

      Version: viem@x.y.z]
    `,
    )
    expect(() =>
      numberToBytes(65536n, { size: 2 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "65536n" is not in safe 16-bit unsigned integer range (0n to 65535n)

      Version: viem@x.y.z]
    `,
    )
    expect(() =>
      numberToBytes(18446744073709551616n, { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "18446744073709551616n" is not in safe 64-bit unsigned integer range (0n to 18446744073709551615n)

      Version: viem@x.y.z]
    `,
    )
  })

  test('args: signed', () => {
    expect(numberToBytes(32n, { size: 1, signed: true })).toMatchInlineSnapshot(
      `
      Uint8Array [
        32,
      ]
    `,
    )
    expect(
      numberToBytes(-32n, {
        size: 1,
        signed: true,
      }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        224,
      ]
    `)
    expect(
      numberToBytes(-32n, {
        size: 4,
        signed: true,
      }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        255,
        255,
        255,
        224,
      ]
    `)

    expect(
      numberToBytes(127n, { size: 2, signed: true }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        0,
        127,
      ]
    `)
    expect(
      numberToBytes(-127n, { size: 2, signed: true }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        255,
        129,
      ]
    `)
    expect(
      numberToBytes(32767n, { size: 2, signed: true }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        127,
        255,
      ]
    `)
    expect(
      numberToBytes(-32768n, { size: 2, signed: true }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        128,
        0,
      ]
    `)

    expect(
      numberToBytes(12312312312312312412n, { size: 32, signed: true }),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        170,
        222,
        30,
        208,
        139,
        11,
        50,
        92,
      ]
    `,
    )
    expect(
      numberToBytes(-12312312312312312412n, { size: 32, signed: true }),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        85,
        33,
        225,
        47,
        116,
        244,
        205,
        164,
      ]
    `,
    )

    expect(() =>
      numberToBytes(170141183460469231731687303715884105728n, {
        size: 16,
        signed: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "170141183460469231731687303715884105728n" is not in safe 128-bit signed integer range (-170141183460469231731687303715884105728n to 170141183460469231731687303715884105727n)

      Version: viem@x.y.z]
    `,
    )
    expect(() =>
      numberToBytes(-170141183460469231731687303715884105729n, {
        size: 16,
        signed: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [IntegerOutOfRangeError: Number "-170141183460469231731687303715884105729n" is not in safe 128-bit signed integer range (-170141183460469231731687303715884105728n to 170141183460469231731687303715884105727n)

      Version: viem@x.y.z]
    `,
    )
  })
})

describe('converts boolean to bytes', () => {
  test('default', () => {
    expect(toBytes(true)).toMatchInlineSnapshot(`
      Uint8Array [
        1,
      ]
    `)
    expect(toBytes(false)).toMatchInlineSnapshot(`
      Uint8Array [
        0,
      ]
    `)

    expect(boolToBytes(true)).toMatchInlineSnapshot(`
      Uint8Array [
        1,
      ]
    `)
    expect(boolToBytes(false)).toMatchInlineSnapshot(`
      Uint8Array [
        0,
      ]
    `)
  })

  test('args: size', () => {
    expect(toBytes(true, { size: 16 })).toMatchInlineSnapshot(
      `
      Uint8Array [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
      ]
    `,
    )
    expect(toBytes(true, { size: 32 })).toMatchInlineSnapshot(
      `
      Uint8Array [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
      ]
    `,
    )
    expect(boolToBytes(false, { size: 16 })).toMatchInlineSnapshot(
      `
      Uint8Array [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]
    `,
    )
    expect(boolToBytes(false, { size: 32 })).toMatchInlineSnapshot(
      `
      Uint8Array [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]
    `,
    )
  })

  test('error: size overflow', () => {
    expect(() => toBytes(true, { size: 0 })).toThrowErrorMatchingInlineSnapshot(
      `
      [SizeOverflowError: Size cannot exceed 0 bytes. Given size: 1 bytes.

      Version: viem@x.y.z]
    `,
    )
    expect(() =>
      boolToBytes(false, { size: 0 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 0 bytes. Given size: 1 bytes.

      Version: viem@x.y.z]
    `)
  })
})

describe('converts hex to bytes', () => {
  test('default', () => {
    expect(toBytes('0x')).toMatchInlineSnapshot('Uint8Array []')
    expect(toBytes('0x61')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
      ]
    `)
    expect(toBytes('0x616263')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
        98,
        99,
      ]
    `)
    expect(toBytes('0x48656c6c6f20576f726c6421')).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
      ]
    `,
    )

    expect(hexToBytes('0x')).toMatchInlineSnapshot('Uint8Array []')
    expect(hexToBytes('0x61')).toMatchInlineSnapshot(`
        Uint8Array [
          97,
        ]
      `)
    expect(hexToBytes('0x616263')).toMatchInlineSnapshot(
      `
        Uint8Array [
          97,
          98,
          99,
        ]
      `,
    )
    expect(hexToBytes('0x48656c6c6f20576f726c6421')).toMatchInlineSnapshot(`
        Uint8Array [
          72,
          101,
          108,
          108,
          111,
          32,
          87,
          111,
          114,
          108,
          100,
          33,
        ]
      `)
    expect(
      hexToBytes('0x48656c6c620576f726c6421ABCDEFabcdef'),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        4,
        134,
        86,
        198,
        198,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        171,
        205,
        239,
        171,
        205,
        239,
      ]
    `)
  })

  test('args: size', () => {
    expect(
      toBytes('0x48656c6c6f20576f726c6421', { size: 16 }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        0,
        0,
        0,
        0,
      ]
    `)
    expect(
      hexToBytes('0x48656c6c6f20576f726c6421', { size: 16 }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        0,
        0,
        0,
        0,
      ]
    `)
    expect(
      toBytes('0x48656c6c6f20576f726c6421', { size: 32 }),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]
    `,
    )
    expect(
      hexToBytes('0x48656c6c6f20576f726c6421', { size: 32 }),
    ).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]
    `,
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      toBytes('0x48656c6c6f20576f726c6421', { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 8 bytes. Given size: 12 bytes.

      Version: viem@x.y.z]
    `)
    expect(() =>
      hexToBytes('0x48656c6c6f20576f726c6421', { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 8 bytes. Given size: 12 bytes.

      Version: viem@x.y.z]
    `)
  })

  test('error: invalid hex', () => {
    expect(() => hexToBytes('0xabcdefgh')).toThrowErrorMatchingInlineSnapshot(`
      [BaseError: Invalid byte sequence ("gh" in "abcdefgh").

      Version: viem@x.y.z]
    `)
  })
})

describe('converts string to bytes', () => {
  test('default', () => {
    expect(toBytes('')).toMatchInlineSnapshot('Uint8Array []')
    expect(toBytes('a')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
      ]
    `)
    expect(toBytes('abc')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
        98,
        99,
      ]
    `)
    expect(toBytes('Hello World!')).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
      ]
    `,
    )

    expect(stringToBytes('')).toMatchInlineSnapshot('Uint8Array []')
    expect(stringToBytes('a')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
      ]
    `)
    expect(stringToBytes('abc')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
        98,
        99,
      ]
    `)
    expect(stringToBytes('Hello World!')).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
      ]
    `,
    )
  })

  test('args: size', () => {
    expect(toBytes('Hello World!', { size: 16 })).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        0,
        0,
        0,
        0,
      ]
    `,
    )
    expect(toBytes('Hello World!', { size: 32 })).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]
    `,
    )
    expect(stringToBytes('Hello World!', { size: 16 })).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        0,
        0,
        0,
        0,
      ]
    `,
    )
    expect(stringToBytes('Hello World!', { size: 32 })).toMatchInlineSnapshot(
      `
      Uint8Array [
        72,
        101,
        108,
        108,
        111,
        32,
        87,
        111,
        114,
        108,
        100,
        33,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]
    `,
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      toBytes('Hello World!', { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 8 bytes. Given size: 12 bytes.

      Version: viem@x.y.z]
    `)
    expect(() =>
      stringToBytes('Hello World!', { size: 8 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 8 bytes. Given size: 12 bytes.

      Version: viem@x.y.z]
    `)
  })
})
