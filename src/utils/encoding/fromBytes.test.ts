import { expect, test } from 'vitest'

import {
  bytesToBigint,
  bytesToBool,
  bytesToHex,
  bytesToNumber,
  bytesToString,
  fromBytes,
} from './fromBytes.js'

test('converts bytes to number', () => {
  expect(fromBytes(new Uint8Array([0]), 'number')).toMatchInlineSnapshot('0')
  expect(fromBytes(new Uint8Array([7]), 'number')).toMatchInlineSnapshot('7')
  expect(fromBytes(new Uint8Array([69]), 'number')).toMatchInlineSnapshot('69')
  expect(fromBytes(new Uint8Array([1, 164]), 'number')).toMatchInlineSnapshot(
    '420',
  )

  expect(bytesToNumber(new Uint8Array([0]))).toMatchInlineSnapshot('0')
  expect(bytesToNumber(new Uint8Array([7]))).toMatchInlineSnapshot('7')
  expect(bytesToNumber(new Uint8Array([69]))).toMatchInlineSnapshot('69')
  expect(bytesToNumber(new Uint8Array([1, 164]))).toMatchInlineSnapshot('420')
})

test('converts bytes to bigint', () => {
  expect(fromBytes(new Uint8Array([0]), 'bigint')).toMatchInlineSnapshot('0n')
  expect(fromBytes(new Uint8Array([7]), 'bigint')).toMatchInlineSnapshot('7n')
  expect(fromBytes(new Uint8Array([69]), 'bigint')).toMatchInlineSnapshot('69n')
  expect(fromBytes(new Uint8Array([1, 164]), 'bigint')).toMatchInlineSnapshot(
    '420n',
  )
  expect(
    fromBytes(
      new Uint8Array([
        12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252, 11,
        117,
      ]),
      'bigint',
    ),
  ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')

  expect(bytesToBigint(new Uint8Array([0]))).toMatchInlineSnapshot('0n')
  expect(bytesToBigint(new Uint8Array([7]))).toMatchInlineSnapshot('7n')
  expect(bytesToBigint(new Uint8Array([69]))).toMatchInlineSnapshot('69n')
  expect(bytesToBigint(new Uint8Array([1, 164]))).toMatchInlineSnapshot('420n')
  expect(
    bytesToBigint(
      new Uint8Array([
        12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252, 11,
        117,
      ]),
    ),
  ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')
})

test('converts bytes to boolean', () => {
  expect(fromBytes(new Uint8Array([0]), 'boolean')).toMatchInlineSnapshot(
    'false',
  )
  expect(fromBytes(new Uint8Array([1]), 'boolean')).toMatchInlineSnapshot(
    'true',
  )

  expect(bytesToBool(new Uint8Array([0]))).toMatchInlineSnapshot('false')
  expect(bytesToBool(new Uint8Array([1]))).toMatchInlineSnapshot('true')

  expect(() =>
    bytesToBool(new Uint8Array([69])),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Bytes value \\"69\\" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.

    Version: viem@1.0.2"
  `)
  expect(() =>
    bytesToBool(new Uint8Array([1, 2])),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Bytes value \\"1,2\\" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.

    Version: viem@1.0.2"
  `)
})

test('converts bytes to string', () => {
  expect(fromBytes(new Uint8Array([]), 'string')).toMatchInlineSnapshot(`""`)
  expect(fromBytes(new Uint8Array([97]), 'string')).toMatchInlineSnapshot(`"a"`)
  expect(
    fromBytes(new Uint8Array([97, 98, 99]), 'string'),
  ).toMatchInlineSnapshot(`"abc"`)
  expect(
    fromBytes(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
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
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    ),
  ).toMatchInlineSnapshot(`"Hello World!"`)
})

test('converts bytes to hex', () => {
  expect(fromBytes(new Uint8Array([97, 98, 99]), 'hex')).toMatchInlineSnapshot(
    '"0x616263"',
  )
  expect(fromBytes(new Uint8Array([97]), 'hex')).toMatchInlineSnapshot('"0x61"')
  expect(fromBytes(new Uint8Array([97, 98, 99]), 'hex')).toMatchInlineSnapshot(
    '"0x616263"',
  )
  expect(
    fromBytes(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
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
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    ),
  ).toMatchInlineSnapshot('"0x48656c6c6f20576f726c6421"')
})
