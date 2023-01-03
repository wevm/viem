import { expect, test } from 'vitest'

import { encodeBytes, hexToBytes, stringToBytes } from './encodeBytes'

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

  expect(() => encodeBytes('0x1')).toThrowErrorMatchingInlineSnapshot(
    '"Hex value is unpadded."',
  )
  expect(() => encodeBytes('0xgg')).toThrowErrorMatchingInlineSnapshot(
    '"Invalid byte sequence"',
  )
})

test('converts string to hex', () => {
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
