import { expect, test } from 'vitest'

import * as clients from './index.js'

test('exports clients', () => {
  expect(clients).toMatchInlineSnapshot(`
    {
      "createClient": [Function],
      "createPublicClient": [Function],
      "createTestClient": [Function],
      "createTransport": [Function],
      "createWalletClient": [Function],
      "custom": [Function],
      "fallback": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
