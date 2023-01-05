import { expect, test } from 'vitest'

import {
  decodeHex,
  hexToBigInt,
  hexToBool,
  hexToNumber,
  hexToString,
} from './decodeHex'

test('converts hex to number', () => {
  expect(decodeHex('0x0', 'number')).toMatchInlineSnapshot('0')
  expect(decodeHex('0x7', 'number')).toMatchInlineSnapshot('7')
  expect(decodeHex('0x45', 'number')).toMatchInlineSnapshot('69')
  expect(decodeHex('0x1a4', 'number')).toMatchInlineSnapshot('420')

  expect(hexToNumber('0x0')).toMatchInlineSnapshot('0')
  expect(hexToNumber('0x7')).toMatchInlineSnapshot('7')
  expect(hexToNumber('0x45')).toMatchInlineSnapshot('69')
  expect(hexToNumber('0x1a4')).toMatchInlineSnapshot('420')
})

test('converts hex to bigint', () => {
  expect(decodeHex('0x0', 'bigint')).toMatchInlineSnapshot('0n')
  expect(decodeHex('0x7', 'bigint')).toMatchInlineSnapshot('7n')
  expect(decodeHex('0x45', 'bigint')).toMatchInlineSnapshot('69n')
  expect(decodeHex('0x1a4', 'bigint')).toMatchInlineSnapshot('420n')
  expect(
    decodeHex('0xc5cf39211876fb5e5884327fa56fc0b75', 'bigint'),
  ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')

  expect(hexToBigInt('0x0')).toMatchInlineSnapshot('0n')
  expect(hexToBigInt('0x7')).toMatchInlineSnapshot('7n')
  expect(hexToBigInt('0x45')).toMatchInlineSnapshot('69n')
  expect(hexToBigInt('0x1a4')).toMatchInlineSnapshot('420n')
  expect(
    hexToBigInt('0xc5cf39211876fb5e5884327fa56fc0b75'),
  ).toMatchInlineSnapshot('4206942069420694206942069420694206942069n')
})

test('converts hex to boolean', () => {
  expect(decodeHex('0x0', 'boolean')).toMatchInlineSnapshot('false')
  expect(decodeHex('0x1', 'boolean')).toMatchInlineSnapshot('true')

  expect(hexToBool('0x0')).toMatchInlineSnapshot('false')
  expect(hexToBool('0x1')).toMatchInlineSnapshot('true')

  expect(() => hexToBool('0xa')).toThrowErrorMatchingInlineSnapshot(
    '"Hex value is not a valid boolean."',
  )
})

test('converts hex to string', () => {
  expect(decodeHex('0x', 'string')).toMatchInlineSnapshot(`""`)
  expect(decodeHex('0x61', 'string')).toMatchInlineSnapshot(`"a"`)
  expect(decodeHex('0x616263', 'string')).toMatchInlineSnapshot(`"abc"`)
  expect(
    decodeHex('0x48656c6c6f20576f726c6421', 'string'),
  ).toMatchInlineSnapshot(`"Hello World!"`)

  expect(hexToString('0x')).toMatchInlineSnapshot(`""`)
  expect(hexToString('0x61')).toMatchInlineSnapshot(`"a"`)
  expect(hexToString('0x616263')).toMatchInlineSnapshot(`"abc"`)
  expect(hexToString('0x48656c6c6f20576f726c6421')).toMatchInlineSnapshot(
    `"Hello World!"`,
  )
})

test('converts hex to bytes', () => {
  expect(decodeHex('0x', 'bytes')).toMatchInlineSnapshot(`Uint8Array []`)
  expect(decodeHex('0x61', 'bytes')).toMatchInlineSnapshot(`
    Uint8Array [
      97,
    ]
  `)
  expect(decodeHex('0x616263', 'bytes')).toMatchInlineSnapshot(
    `
    Uint8Array [
      97,
      98,
      99,
    ]
  `,
  )
  expect(decodeHex('0x48656c6c6f20576f726c6421', 'bytes'))
    .toMatchInlineSnapshot(`
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

  expect(() => decodeHex('0xgg', 'bytes')).toThrowErrorMatchingInlineSnapshot(
    '"Invalid byte sequence"',
  )
})
