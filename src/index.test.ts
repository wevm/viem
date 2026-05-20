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
      "custom",
      "fallback",
      "http",
      "publicActions",
      "testActions",
      "webSocket",
    ]
  `)
})
