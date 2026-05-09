import { expect, test } from 'vitest'

import { toHex } from '../../utils/encoding/toHex.js'

import { parseSignature } from './parseSignature.js'

test('default', () => {
  expect(
    parseSignature(
      '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c',
    ),
  ).toEqual({
    r: toHex(
      49782753348462494199823712700004552394425719014458918871452329774910450607807n,
    ),
    s: toHex(
      33726695977844476214676913201140481102225469284307016937915595756355928419768n,
    ),
    v: 28n,
    yParity: 1,
  })

  expect(
    parseSignature(
      '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81b',
    ),
  ).toEqual({
    r: toHex(
      49782753348462494199823712700004552394425719014458918871452329774910450607807n,
    ),
    s: toHex(
      33726695977844476214676913201140481102225469284307016937915595756355928419768n,
    ),
    v: 27n,
    yParity: 0,
  })

  expect(
    parseSignature(
      '0x602381e57b70f1ada20bd56a806291cfc5cb5088f00f0e791510fd8b8cf05cc40dea7b983e0c7d204f3dc511b1f19a2787a5c82cd72f3bd38da58f10969907841b',
    ),
  ).toEqual({
    r: '0x602381e57b70f1ada20bd56a806291cfc5cb5088f00f0e791510fd8b8cf05cc4',
    s: '0x0dea7b983e0c7d204f3dc511b1f19a2787a5c82cd72f3bd38da58f1096990784',
    v: 27n,
    yParity: 0,
  })

  expect(
    parseSignature(
      '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b00',
    ),
  ).toEqual({
    r: '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf1',
    s: '0x5fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b',
    yParity: 0,
  })

  expect(
    parseSignature(
      '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e09884901',
    ),
  ).toEqual({
    r: '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db08',
    s: '0x31538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e098849',
    yParity: 1,
  })
})

test('invalid yParityOrV value', async () => {
  expect(() =>
    parseSignature(
      '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81d',
    ),
  ).toThrowErrorMatchingInlineSnapshot('[Error: Invalid yParityOrV value]')
  expect(() =>
    parseSignature(
      '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db802',
    ),
  ).toThrowErrorMatchingInlineSnapshot('[Error: Invalid yParityOrV value]')
  expect(() =>
    parseSignature(
      '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81a',
    ),
  ).toThrowErrorMatchingInlineSnapshot('[Error: Invalid yParityOrV value]')
})
