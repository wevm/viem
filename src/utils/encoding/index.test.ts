import { expect, test } from 'vitest'

import * as utils from './index.js'

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
      "fromBytes": [Function],
      "fromHex": [Function],
      "fromRlp": [Function],
      "hexToBigInt": [Function],
      "hexToBool": [Function],
      "hexToBytes": [Function],
      "hexToNumber": [Function],
      "hexToString": [Function],
      "numberToBytes": [Function],
      "numberToHex": [Function],
      "stringToBytes": [Function],
      "stringToHex": [Function],
      "toBytes": [Function],
      "toHex": [Function],
      "toRlp": [Function],
    }
  `)
})
