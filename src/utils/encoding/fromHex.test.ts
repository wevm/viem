import type { Hex } from 'viem'
import { describe, expect, test } from 'vitest'

import {
  fromHex,
  hexToBigInt,
  hexToBool,
  hexToNumber,
  hexToString,
} from './fromHex.js'
import { hexToBytes } from './toBytes.js'
import { boolToHex, bytesToHex, numberToHex, stringToHex } from './toHex.js'

describe('converts hex to number', () => {
  test('default', () => {
    expect(fromHex('0x0', 'number')).toMatchInlineSnapshot('0')
    expect(fromHex('0x7', 'number')).toMatchInlineSnapshot('7')
    expect(fromHex('0x45', 'number')).toMatchInlineSnapshot('69')
    expect(fromHex('0x1a4', 'number')).toMatchInlineSnapshot('420')

    expect(hexToNumber('0x0')).toMatchInlineSnapshot('0')
    expect(hexToNumber('0x7')).toMatchInlineSnapshot('7')
    expect(hexToNumber('0x45')).toMatchInlineSnapshot('69')
    expect(hexToNumber('0x1a4')).toMatchInlineSnapshot('420')
  })

  test('args: signed', () => {
    expect(hexToNumber('0x20', { signed: true })).toBe(32)
    expect(
      hexToNumber('0xe0', {
        signed: true,
      }),
    ).toBe(-32)
    expect(
      hexToNumber('0xffffffe0', {
        signed: true,
      }),
    ).toBe(-32)

    expect(hexToNumber('0x007f', { signed: true })).toBe(127)
    expect(hexToNumber('0xff81', { signed: true })).toBe(-127)
    expect(hexToNumber('0x7fff', { signed: true })).toBe(32767)
    expect(hexToNumber('0x8000', { signed: true })).toBe(-32768)

    expect(hexToNumber('0xffff', { signed: true })).toBe(-1)
    expect(hexToNumber('0x4961769b', { signed: true })).toBe(1231124123)
    expect(hexToNumber('0x00027760a62ec2ac', { signed: true })).toBe(
      694206942069420,
    )

    // odd-length hex
    expect(hexToNumber('0x0', { signed: true })).toBe(0)
    expect(hexToNumber('0x1a4', { signed: true })).toBe(420)
  })

  test('args: size', () => {
    expect(
      fromHex(numberToHex(69420, { size: 32 }), { size: 32, to: 'number' }),
    ).toEqual(69420)
    expect(hexToNumber(numberToHex(69420, { size: 32 }), { size: 32 })).toEqual(
      69420,
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      hexToNumber(numberToHex(69420, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })

  test('error: integer out of range', () => {
    expect(() =>
      hexToNumber('0x20000000000000'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [IntegerOutOfRangeError: Number "9007199254740992n" is not in safe integer range (-9007199254740991 to 9007199254740991)

      Version: viem@x.y.z]
    `)
    expect(() =>
      hexToNumber('0xffdfffffffffffff', { signed: true }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [IntegerOutOfRangeError: Number "-9007199254740993n" is not in safe integer range (-9007199254740991 to 9007199254740991)

      Version: viem@x.y.z]
    `)
  })
})

test('hexToNumber and hexToBigInt edge cases', () => {
  const run = (fn: () => unknown) => {
    try {
      return fn()
    } catch (error) {
      return `${(error as Error).name}: ${(error as Error).message.split('\n')[0]}`
    }
  }
  const hexes = [
    '0x',
    '0x0',
    '0x1a',
    '0X1a',
    '0x1a ',
    '0x1fffffffffffff',
    '0x20000000000000',
    `0x${'0'.repeat(50)}1fffffffffffff`,
    '0x7f',
    '0x80',
    '0xff',
    '0xfff',
    '0x8000',
    `0x${'f'.repeat(64)}`,
    `0x8${'0'.repeat(63)}`,
    '0x1_0',
    '0xzz',
    '1234',
    '',
  ] as Hex[]

  expect(
    hexes.map((hex) => [
      hex,
      run(() => hexToNumber(hex)),
      run(() => hexToNumber(hex, { signed: true })),
      run(() => hexToBigInt(hex, { signed: true })),
    ]),
  ).toMatchInlineSnapshot(`
    [
      [
        "0x",
        "SyntaxError: Cannot convert 0x to a BigInt",
        "SyntaxError: Cannot convert 0x to a BigInt",
        "SyntaxError: Cannot convert 0x to a BigInt",
      ],
      [
        "0x0",
        0,
        0,
        0n,
      ],
      [
        "0x1a",
        26,
        26,
        26n,
      ],
      [
        "0X1a",
        26,
        26,
        26n,
      ],
      [
        "0x1a ",
        26,
        26,
        26n,
      ],
      [
        "0x1fffffffffffff",
        9007199254740991,
        9007199254740991,
        9007199254740991n,
      ],
      [
        "0x20000000000000",
        "IntegerOutOfRangeError: Number "9007199254740992n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        "IntegerOutOfRangeError: Number "9007199254740992n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        9007199254740992n,
      ],
      [
        "0x000000000000000000000000000000000000000000000000001fffffffffffff",
        9007199254740991,
        9007199254740991,
        9007199254740991n,
      ],
      [
        "0x7f",
        127,
        127,
        127n,
      ],
      [
        "0x80",
        128,
        -128,
        -128n,
      ],
      [
        "0xff",
        255,
        -1,
        -1n,
      ],
      [
        "0xfff",
        4095,
        4095,
        4095n,
      ],
      [
        "0x8000",
        32768,
        -32768,
        -32768n,
      ],
      [
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "IntegerOutOfRangeError: Number "115792089237316195423570985008687907853269984665640564039457584007913129639935n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        -1,
        -1n,
      ],
      [
        "0x8000000000000000000000000000000000000000000000000000000000000000",
        "IntegerOutOfRangeError: Number "57896044618658097711785492504343953926634992332820282019728792003956564819968n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        "IntegerOutOfRangeError: Number "-57896044618658097711785492504343953926634992332820282019728792003956564819968n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        -57896044618658097711785492504343953926634992332820282019728792003956564819968n,
      ],
      [
        "0x1_0",
        "SyntaxError: Cannot convert 0x1_0 to a BigInt",
        "SyntaxError: Cannot convert 0x1_0 to a BigInt",
        "SyntaxError: Cannot convert 0x1_0 to a BigInt",
      ],
      [
        "0xzz",
        "SyntaxError: Cannot convert 0xzz to a BigInt",
        "SyntaxError: Cannot convert 0xzz to a BigInt",
        "SyntaxError: Cannot convert 0xzz to a BigInt",
      ],
      [
        "1234",
        1234,
        978,
        978n,
      ],
      [
        "",
        0,
        -16,
        -16n,
      ],
    ]
  `)
})

describe('converts hex to bigint', () => {
  test('default', () => {
    expect(fromHex('0x0', 'bigint')).toMatchInlineSnapshot('0n')
    expect(fromHex('0x7', 'bigint')).toMatchInlineSnapshot('7n')
    expect(fromHex('0x45', 'bigint')).toMatchInlineSnapshot('69n')
    expect(fromHex('0x1a4', 'bigint')).toMatchInlineSnapshot('420n')
    expect(
      fromHex('0xc5cf39211876fb5e5884327fa56fc0b75', 'bigint'),
    ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')

    expect(hexToBigInt('0x0')).toMatchInlineSnapshot('0n')
    expect(hexToBigInt('0x7')).toMatchInlineSnapshot('7n')
    expect(hexToBigInt('0x45')).toMatchInlineSnapshot('69n')
    expect(hexToBigInt('0x1a4')).toMatchInlineSnapshot('420n')
    expect(
      hexToBigInt('0xc5cf39211876fb5e5884327fa56fc0b75'),
    ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')
  })

  test('args: signed', () => {
    expect(hexToBigInt('0x20', { signed: true })).toBe(32n)
    expect(
      hexToBigInt('0xe0', {
        signed: true,
      }),
    ).toBe(-32n)

    expect(hexToBigInt('0x007f', { signed: true })).toBe(127n)
    expect(hexToBigInt('0xff81', { signed: true })).toBe(-127n)
    expect(hexToBigInt('0x7fff', { signed: true })).toBe(32767n)
    expect(hexToBigInt('0x8000', { signed: true })).toBe(-32768n)

    expect(
      hexToBigInt(
        '0x000000000000000000000000000000000000000000000000aade1ed08b0b325c',
        { signed: true },
      ),
    ).toBe(12312312312312312412n)
    expect(
      hexToBigInt(
        '0xffffffffffffffffffffffffffffffffffffffffffffffff5521e12f74f4cda4',
        { signed: true },
      ),
    ).toBe(-12312312312312312412n)

    // odd-length hex
    expect(hexToBigInt('0x0', { signed: true })).toBe(0n)
    expect(hexToBigInt('0xf', { signed: true })).toBe(15n)
    expect(hexToBigInt('0x1a4', { signed: true })).toBe(420n)
  })

  test('args: size', () => {
    expect(
      fromHex(numberToHex(69420n, { size: 32 }), { size: 32, to: 'bigint' }),
    ).toEqual(69420n)
    expect(
      hexToBigInt(numberToHex(69420n, { size: 32 }), { size: 32 }),
    ).toEqual(69420n)
  })

  test('error: size overflow', () => {
    expect(() =>
      hexToBigInt(numberToHex(69420, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })
})

describe('converts hex to boolean', () => {
  test('default', () => {
    expect(fromHex('0x0', 'boolean')).toMatchInlineSnapshot('false')
    expect(fromHex('0x1', 'boolean')).toMatchInlineSnapshot('true')

    expect(hexToBool('0x0')).toMatchInlineSnapshot('false')
    expect(hexToBool('0x1')).toMatchInlineSnapshot('true')
  })

  test('args: size', () => {
    expect(
      fromHex(boolToHex(true, { size: 32 }), { size: 32, to: 'boolean' }),
    ).toEqual(true)
    expect(hexToBool(boolToHex(true, { size: 32 }), { size: 32 })).toEqual(true)
  })

  test('error: size overflow', () => {
    expect(() =>
      hexToBool(boolToHex(true, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })

  test('error: invalid boolean', () => {
    expect(() => hexToBool('0xa')).toThrowErrorMatchingInlineSnapshot(
      `
      [InvalidHexBooleanError: Hex value "0xa" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).

      Version: viem@x.y.z]
    `,
    )
  })
})

describe('converts hex to string', () => {
  test('default', () => {
    expect(fromHex('0x', 'string')).toMatchInlineSnapshot(`""`)
    expect(fromHex('0x61', 'string')).toMatchInlineSnapshot(`"a"`)
    expect(fromHex('0x616263', 'string')).toMatchInlineSnapshot(`"abc"`)
    expect(
      fromHex('0x48656c6c6f20576f726c6421', 'string'),
    ).toMatchInlineSnapshot(`"Hello World!"`)

    expect(hexToString('0x')).toMatchInlineSnapshot(`""`)
    expect(hexToString('0x61')).toMatchInlineSnapshot(`"a"`)
    expect(hexToString('0x616263')).toMatchInlineSnapshot(`"abc"`)
    expect(hexToString('0x48656c6c6f20576f726c6421')).toMatchInlineSnapshot(
      `"Hello World!"`,
    )
  })

  test('args: size', () => {
    expect(
      fromHex(stringToHex('wagmi', { size: 32 }), {
        size: 32,
        to: 'string',
      }),
    ).toEqual('wagmi')
    expect(
      hexToString(stringToHex('wagmi', { size: 32 }), { size: 32 }),
    ).toEqual('wagmi')
  })

  test('error: size overflow', () => {
    expect(() =>
      hexToString(stringToHex('wagmi', { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })

  test('behavior: an incomplete sequence does not affect the next call', () => {
    expect(hexToString('0xe282')).toBe('\ufffd')
    expect(hexToString('0xac41')).toBe('\ufffdA')
  })
})

describe('converts hex to bytes', () => {
  test('default', () => {
    expect(fromHex('0x', 'bytes')).toMatchInlineSnapshot('Uint8Array []')
    expect(fromHex('0x61', 'bytes')).toMatchInlineSnapshot(`
      Uint8Array [
        97,
      ]
    `)
    expect(fromHex('0x616263', 'bytes')).toMatchInlineSnapshot(
      `
      Uint8Array [
        97,
        98,
        99,
      ]
    `,
    )
    expect(
      fromHex('0x48656c6c6f20576f726c6421', 'bytes'),
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
      ]
    `)
  })

  test('args: size', () => {
    expect(
      fromHex(bytesToHex(Uint8Array.from([69, 420]), { size: 32 }), {
        size: 32,
        to: 'bytes',
      }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        69,
        164,
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
    `)
    expect(
      hexToBytes(bytesToHex(Uint8Array.from([69, 420]), { size: 32 }), {
        size: 32,
      }),
    ).toMatchInlineSnapshot(`
      Uint8Array [
        69,
        164,
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
    `)
  })

  test('error: size overflow', () => {
    expect(() =>
      hexToString(bytesToHex(Uint8Array.from([69, 420]), { size: 64 }), {
        size: 32,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })

  test('error: invalid bytes', () => {
    expect(() =>
      fromHex('0x420fggf11a', 'bytes'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [BaseError: Invalid byte sequence ("gg" in "420fggf11a").

      Version: viem@x.y.z]
    `)
  })
})
