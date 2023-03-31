import { expect, test } from 'vitest'

import * as abi from './abi.js'

test('exports abi utils', () => {
  expect(Object.keys(abi)).toMatchInlineSnapshot(`
    [
      "decodeAbiParameters",
      "encodeAbiParameters",
      "encodePacked",
      "getAbiItem",
      "parseAbi",
      "parseAbiItem",
      "parseAbiParameter",
      "parseAbiParameters",
    ]
  `)
})
