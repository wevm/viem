import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "bytesToHex": [Function],
      "bytesToString": [Function],
      "decodeBytes": [Function],
      "decodeHex": [Function],
      "encodeBytes": [Function],
      "encodeHex": [Function],
      "hexToBigInt": [Function],
      "hexToBytes": [Function],
      "hexToNumber": [Function],
      "hexToString": [Function],
      "numberToHex": [Function],
      "stringToBytes": [Function],
      "stringToHex": [Function],
    }
  `)
})
