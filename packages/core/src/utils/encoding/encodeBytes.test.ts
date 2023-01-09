import { expect, test } from 'vitest'

import {
  boolToBytes,
  encodeBytes,
  hexToBytes,
  numberToBytes,
  stringToBytes,
} from './encodeBytes'

test('converts numbers to bytes', () => {
  expect(encodeBytes(0)).toMatchInlineSnapshot(`
    Uint8Array [
      0,
    ]
  `)
  expect(encodeBytes(7)).toMatchInlineSnapshot(`
    Uint8Array [
      7,
    ]
  `)
  expect(encodeBytes(69)).toMatchInlineSnapshot(`
    Uint8Array [
      69,
    ]
  `)
  expect(encodeBytes(420)).toMatchInlineSnapshot(`
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
})

test('converts bigints to bytes', () => {
  expect(encodeBytes(0n)).toMatchInlineSnapshot(`
    Uint8Array [
      0,
    ]
  `)
  expect(encodeBytes(7n)).toMatchInlineSnapshot(`
    Uint8Array [
      7,
    ]
  `)
  expect(encodeBytes(69n)).toMatchInlineSnapshot(`
    Uint8Array [
      69,
    ]
  `)
  expect(encodeBytes(420n)).toMatchInlineSnapshot(`
    Uint8Array [
      1,
      164,
    ]
  `)
  expect(encodeBytes(4206942069420694206942069420694206942069n))
    .toMatchInlineSnapshot(`
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
  expect(numberToBytes(4206942069420694206942069420694206942069n))
    .toMatchInlineSnapshot(`
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

test('converts boolean to bytes', () => {
  expect(encodeBytes(true)).toMatchInlineSnapshot(`
    Uint8Array [
      1,
    ]
  `)
  expect(encodeBytes(false)).toMatchInlineSnapshot(`
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

test('converts hex to bytes', () => {
  expect(encodeBytes('0x')).toMatchInlineSnapshot('Uint8Array []')
  expect(encodeBytes('0x61')).toMatchInlineSnapshot(`
    Uint8Array [
      97,
    ]
  `)
  expect(encodeBytes('0x616263')).toMatchInlineSnapshot(`
    Uint8Array [
      97,
      98,
      99,
    ]
  `)
  expect(encodeBytes('0x48656c6c6f20576f726c6421')).toMatchInlineSnapshot(
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

  expect(hexToBytes('0x')).toMatchInlineSnapshot(`Uint8Array []`)
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

  expect(() => encodeBytes('0xgg')).toThrowErrorMatchingInlineSnapshot(
    '"Invalid byte sequence"',
  )
})

test('converts string to bytes', () => {
  expect(encodeBytes('')).toMatchInlineSnapshot('Uint8Array []')
  expect(encodeBytes('a')).toMatchInlineSnapshot(`
    Uint8Array [
      97,
    ]
  `)
  expect(encodeBytes('abc')).toMatchInlineSnapshot(`
    Uint8Array [
      97,
      98,
      99,
    ]
  `)
  expect(encodeBytes('Hello World!')).toMatchInlineSnapshot(
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
