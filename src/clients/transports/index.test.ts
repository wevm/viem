import { expect, test } from 'vitest'

import * as transports from './index.js'

test('exports transports', () => {
  expect(transports).toMatchInlineSnapshot(`
    {
      "createTransport": [Function],
      "custom": [Function],
      "fallback": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
