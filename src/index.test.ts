import { expect, test } from 'vp/test'

import * as viem from './index.js'

test('exports', () => {
  expect(Object.keys(viem).sort()).toMatchInlineSnapshot(`
    [
      "Account",
      "BaseError",
      "Chain",
      "Client",
      "Transport",
      "actions",
      "custom",
      "fallback",
      "http",
      "publicActions",
      "testActions",
      "webSocket",
    ]
  `)
  expect(typeof viem.actions.getBlockNumber).toMatchInlineSnapshot(`"function"`)
})
