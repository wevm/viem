import { expect, test } from 'vitest'

import * as viem from '../index.js'

test('exports', () => {
  expect(Object.keys(viem)).toMatchInlineSnapshot(`
    [
      "Errors",
      "AbiEvent",
      "AbiFunction",
      "AbiItem",
      "Address",
      "Bytes",
      "ContractAddress",
      "Hash",
      "Hex",
      "Rlp",
      "Value",
    ]
  `)
})
