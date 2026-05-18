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
