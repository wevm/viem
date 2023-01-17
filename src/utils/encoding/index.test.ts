import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "boolToBytes": [Function],
      "boolToHex": [Function],
      "bytesToBigint": [Function],
      "bytesToBool": [Function],
      "bytesToHex": [Function],
      "bytesToNumber": [Function],
      "bytesToString": [Function],
      "decodeBytes": [Function],
      "decodeHex": [Function],
      "decodeRlp": [Function],
      "encodeBytes": [Function],
      "encodeHex": [Function],
      "encodeRlp": [Function],
      "hexToBigInt": [Function],
      "hexToBool": [Function],
      "hexToBytes": [Function],
      "hexToNumber": [Function],
      "hexToString": [Function],
      "numberToBytes": [Function],
      "numberToHex": [Function],
      "stringToBytes": [Function],
      "stringToHex": [Function],
    }
  `)
})
