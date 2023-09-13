import { expect, test } from 'vitest'

import * as abi from './index.js'

test('exports abi utils', () => {
  expect(Object.keys(abi)).toMatchInlineSnapshot(`
    [
      "decodeAbiParameters",
      "encodeAbiParameters",
      "getAbiItem",
      "parseAbi",
      "parseAbiItem",
      "parseAbiParameter",
      "parseAbiParameters",
      "encodePacked",
    ]
  `)
})
