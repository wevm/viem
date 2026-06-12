import { expect, test } from 'vitest'

import * as viem from '../index.js'

test('exports', () => {
  expect(Object.keys(viem)).toMatchInlineSnapshot(`
    [
      "Bytes",
      "Errors",
      "Hex",
      "Rlp",
    ]
  `)
})
