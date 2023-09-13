import { expect, test } from 'vitest'

import * as abi from './index.js'

test('exports abi utils', () => {
  expect(Object.keys(abi)).toMatchInlineSnapshot(`
    [
      "parseAbi",
      "parseAbiItem",
      "parseAbiParameter",
      "parseAbiParameters",
      "decodeAbiParameters",
      "encodeAbiParameters",
      "getAbiItem",
      "encodePacked",
    ]
  `)
})
