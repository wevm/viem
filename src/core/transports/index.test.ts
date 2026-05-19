import { expect, test } from 'vp/test'

import * as transports from './index.js'

test('exports', () => {
  expect(Object.keys(transports).sort()).toMatchInlineSnapshot(`
    [
      "custom",
      "fallback",
      "http",
      "webSocket",
    ]
  `)
})
