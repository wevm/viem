import { expect, test } from 'vitest'

import * as Abis from './Abis.js'

test('exports', () => {
  expect(Object.keys(Abis)).toMatchInlineSnapshot(`
    [
      "erc20",
      "erc721",
      "erc1155",
      "erc4626",
    ]
  `)
})
