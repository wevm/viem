import { describe, expect, test } from 'vitest'

import {
  bytesToBigInt,
  bytesToBool,
  bytesToNumber,
  bytesToString,
  fromBytes,
} from './fromBytes.js'
import {
  boolToBytes,
  hexToBytes,
  numberToBytes,
  stringToBytes,
} from './toBytes.js'
import { bytesToHex } from './toHex.js'

describe('converts bytes to number', () => {
  test('default', () => {
    expect(fromBytes(new Uint8Array([0]), 'number')).toMatchInlineSnapshot('0')
    expect(fromBytes(new Uint8Array([7]), 'number')).toMatchInlineSnapshot('7')
    expect(fromBytes(new Uint8Array([69]), 'number')).toMatchInlineSnapshot(
      '69',
    )
    expect(fromBytes(new Uint8Array([1, 164]), 'number')).toMatchInlineSnapshot(
      '420',
    )

    expect(bytesToNumber(new Uint8Array([0]))).toMatchInlineSnapshot('0')
    expect(bytesToNumber(new Uint8Array([7]))).toMatchInlineSnapshot('7')
    expect(bytesToNumber(new Uint8Array([69]))).toMatchInlineSnapshot('69')
    expect(bytesToNumber(new Uint8Array([1, 164]))).toMatchInlineSnapshot('420')
  })

  test('args: size', () => {
    expect(
      fromBytes(numberToBytes(420, { size: 32 }), { size: 32, to: 'number' }),
    ).toEqual(420)
    expect(
      bytesToNumber(numberToBytes(420, { size: 32 }), {
        size: 32,
      }),
    ).toEqual(420)
    expect(bytesToNumber(new Uint8Array([1, 164]), { size: 32 })).toEqual(420)
  })

  test('error: size overflow', () => {
    expect(() =>
      bytesToNumber(numberToBytes(69420, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })
})

describe('converts bytes to bigint', () => {
  test('default', () => {
    expect(fromBytes(new Uint8Array([0]), 'bigint')).toMatchInlineSnapshot('0n')
    expect(fromBytes(new Uint8Array([7]), 'bigint')).toMatchInlineSnapshot('7n')
    expect(fromBytes(new Uint8Array([69]), 'bigint')).toMatchInlineSnapshot(
      '69n',
    )
    expect(fromBytes(new Uint8Array([1, 164]), 'bigint')).toMatchInlineSnapshot(
      '420n',
    )
    expect(
      fromBytes(
        new Uint8Array([
          12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252,
          11, 117,
        ]),
        'bigint',
      ),
    ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')

    expect(bytesToBigInt(new Uint8Array([0]))).toMatchInlineSnapshot('0n')
    expect(bytesToBigInt(new Uint8Array([7]))).toMatchInlineSnapshot('7n')
    expect(bytesToBigInt(new Uint8Array([69]))).toMatchInlineSnapshot('69n')
    expect(bytesToBigInt(new Uint8Array([1, 164]))).toMatchInlineSnapshot(
      '420n',
    )
    expect(
      bytesToBigInt(
        new Uint8Array([
          12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252,
          11, 117,
        ]),
      ),
    ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')
  })

  test('args: size', () => {
    expect(
      fromBytes(numberToBytes(420n, { size: 32 }), { size: 32, to: 'bigint' }),
    ).toEqual(420n)
    expect(
      bytesToBigInt(numberToBytes(420n, { size: 32 }), {
        size: 32,
      }),
    ).toEqual(420n)
    expect(bytesToBigInt(new Uint8Array([1, 164]), { size: 32 })).toEqual(420n)
  })

  test('error: size overflow', () => {
    expect(() =>
      bytesToBigInt(numberToBytes(69420, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })
})

test('bytesToNumber and bytesToBigInt edge cases', () => {
  const run = (fn: () => unknown) => {
    try {
      return fn()
    } catch (error) {
      return `${(error as Error).name}: ${(error as Error).message.split('\n')[0]}`
    }
  }
  const bytes = [
    [],
    [0],
    [0, 0, 0, 0, 0, 0, 0, 0x20],
    [0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    [0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    [0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    [0x20, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0x80],
    [0xff, 0xfe],
  ].map((value) => new Uint8Array(value))

  expect(
    bytes.map((value) => [
      bytesToHex(value),
      run(() => bytesToNumber(value)),
      run(() => bytesToBigInt(value)),
      run(() => bytesToNumber(value, { signed: true })),
      run(() => bytesToBigInt(value, { size: 7 })),
    ]),
  ).toMatchInlineSnapshot(`
    [
      [
        "0x",
        "SyntaxError: Cannot convert 0x to a BigInt",
        "SyntaxError: Cannot convert 0x to a BigInt",
        "SyntaxError: Cannot convert 0x to a BigInt",
        "SyntaxError: Cannot convert 0x to a BigInt",
      ],
      [
        "0x00",
        0,
        0n,
        0,
        0n,
      ],
      [
        "0x0000000000000020",
        32,
        32n,
        32,
        "SizeOverflowError: Size cannot exceed 7 bytes. Given size: 8 bytes.",
      ],
      [
        "0xffffffffffff",
        281474976710655,
        281474976710655n,
        -1,
        281474976710655n,
      ],
      [
        "0x00ffffffffffff",
        281474976710655,
        281474976710655n,
        281474976710655,
        281474976710655n,
      ],
      [
        "0x1fffffffffffff",
        9007199254740991,
        9007199254740991n,
        9007199254740991,
        9007199254740991n,
      ],
      [
        "0x20000000000000",
        "IntegerOutOfRangeError: Number "9007199254740992n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        9007199254740992n,
        "IntegerOutOfRangeError: Number "9007199254740992n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        9007199254740992n,
      ],
      [
        "0x010000000000000000",
        "IntegerOutOfRangeError: Number "18446744073709551616n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        18446744073709551616n,
        "IntegerOutOfRangeError: Number "18446744073709551616n" is not in safe integer range (-9007199254740991 to 9007199254740991)",
        "SizeOverflowError: Size cannot exceed 7 bytes. Given size: 9 bytes.",
      ],
      [
        "0x80",
        128,
        128n,
        -128,
        128n,
      ],
      [
        "0xfffe",
        65534,
        65534n,
        -2,
        65534n,
      ],
    ]
  `)
})

describe('converts bytes to boolean', () => {
  test('default', () => {
    expect(fromBytes(new Uint8Array([0]), 'boolean')).toMatchInlineSnapshot(
      'false',
    )
    expect(fromBytes(new Uint8Array([1]), 'boolean')).toMatchInlineSnapshot(
      'true',
    )

    expect(bytesToBool(new Uint8Array([0]))).toMatchInlineSnapshot('false')
    expect(bytesToBool(new Uint8Array([1]))).toMatchInlineSnapshot('true')
  })

  test('args: size', () => {
    expect(
      fromBytes(boolToBytes(true, { size: 32 }), { size: 32, to: 'boolean' }),
    ).toEqual(true)
    expect(
      bytesToBool(boolToBytes(true, { size: 32 }), {
        size: 32,
      }),
    ).toEqual(true)
  })

  test('error: size overflow', () => {
    expect(() =>
      bytesToBool(boolToBytes(true, { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })

  test('error: invalid boolean', () => {
    expect(() =>
      bytesToBool(new Uint8Array([69])),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidBytesBooleanError: Bytes value "69" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.

      Version: viem@x.y.z]
    `)
    expect(() =>
      bytesToBool(new Uint8Array([1, 2])),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidBytesBooleanError: Bytes value "1,2" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.

      Version: viem@x.y.z]
    `)
  })
})

describe('converts bytes to string', () => {
  test.each([
    [new Uint8Array([239, 187, 191, 104, 101, 108, 108, 111]), '\uFEFFhello'],
    [new Uint8Array([239, 187, 191]), '\uFEFF'],
    [
      new Uint8Array([239, 187, 191, 239, 187, 191, 104, 101, 108, 108, 111]),
      '\uFEFF\uFEFFhello',
    ],
    [new Uint8Array([104, 101, 108, 108, 111, 239, 187, 191]), 'hello\uFEFF'],
  ] as const)('preserves U+FEFF in %j', (value, expected) => {
    const result = bytesToString(value)

    expect(result).toBe(expected)
    expect(fromBytes(value, 'string')).toBe(expected)
    expect(bytesToString(value)).toBe(expected)
  })

  test('preserves U+FEFF with size and right padding', () => {
    const value = new Uint8Array([239, 187, 191, 0, 0])

    expect(bytesToString(value, { size: 5 })).toBe('\uFEFF')
    expect(fromBytes(value, { to: 'string', size: 5 })).toBe('\uFEFF')
  })

  test('default', () => {
    expect(fromBytes(new Uint8Array([]), 'string')).toMatchInlineSnapshot(`""`)
    expect(fromBytes(new Uint8Array([97]), 'string')).toMatchInlineSnapshot(
      `"a"`,
    )
    expect(
      fromBytes(new Uint8Array([97, 98, 99]), 'string'),
    ).toMatchInlineSnapshot(`"abc"`)
    expect(
      fromBytes(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
        'string',
      ),
    ).toMatchInlineSnapshot(`"Hello World!"`)

    expect(bytesToString(new Uint8Array([]))).toMatchInlineSnapshot(`""`)
    expect(bytesToString(new Uint8Array([97]))).toMatchInlineSnapshot(`"a"`)
    expect(bytesToString(new Uint8Array([97, 98, 99]))).toMatchInlineSnapshot(
      `"abc"`,
    )
    expect(
      bytesToString(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
      ),
    ).toMatchInlineSnapshot(`"Hello World!"`)
  })

  test('args: size', () => {
    expect(
      fromBytes(stringToBytes('wagmi', { size: 32 }), {
        size: 32,
        to: 'string',
      }),
    ).toEqual('wagmi')
    expect(
      bytesToString(stringToBytes('wagmi', { size: 32 }), {
        size: 32,
      }),
    ).toEqual('wagmi')
  })

  test('error: size overflow', () => {
    expect(() =>
      bytesToString(stringToBytes('wagmi', { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })

  test('behavior: an incomplete sequence does not affect the next call', () => {
    expect(bytesToString(new Uint8Array([0xe2, 0x82]))).toBe('\ufffd')
    expect(bytesToString(new Uint8Array([0xac, 0x41]))).toBe('\ufffdA')
  })
})

describe('converts bytes to hex', () => {
  test('default', () => {
    expect(
      fromBytes(new Uint8Array([97, 98, 99]), 'hex'),
    ).toMatchInlineSnapshot('"0x616263"')
    expect(fromBytes(new Uint8Array([97]), 'hex')).toMatchInlineSnapshot(
      '"0x61"',
    )
    expect(
      fromBytes(new Uint8Array([97, 98, 99]), 'hex'),
    ).toMatchInlineSnapshot('"0x616263"')
    expect(
      fromBytes(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
        'hex',
      ),
    ).toMatchInlineSnapshot('"0x48656c6c6f20576f726c6421"')

    expect(bytesToHex(new Uint8Array([97, 98, 99]))).toMatchInlineSnapshot(
      '"0x616263"',
    )
    expect(bytesToHex(new Uint8Array([97]))).toMatchInlineSnapshot('"0x61"')
    expect(bytesToHex(new Uint8Array([97, 98, 99]))).toMatchInlineSnapshot(
      '"0x616263"',
    )
    expect(
      bytesToHex(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
      ),
    ).toMatchInlineSnapshot('"0x48656c6c6f20576f726c6421"')
  })

  test('args: size', () => {
    expect(
      fromBytes(hexToBytes('0x420696', { size: 32 }), {
        size: 32,
        to: 'hex',
      }),
    ).toMatchInlineSnapshot(
      '"0x4206960000000000000000000000000000000000000000000000000000000000"',
    )
    expect(
      bytesToHex(hexToBytes('0x420696', { size: 32 }), {
        size: 32,
      }),
    ).toMatchInlineSnapshot(
      '"0x4206960000000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('error: size overflow', () => {
    expect(() =>
      bytesToHex(hexToBytes('0x420696', { size: 64 }), { size: 32 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [SizeOverflowError: Size cannot exceed 32 bytes. Given size: 64 bytes.

      Version: viem@x.y.z]
    `)
  })
})
