import { expect, test } from 'vitest'

import * as rpcs from './index'

test('exports rpcs', () => {
  expect(rpcs).toMatchInlineSnapshot(`
    {
      "createClient": [Function],
      "createPublicClient": [Function],
      "createTestClient": [Function],
      "createTransport": [Function],
      "createWalletClient": [Function],
      "ethereumProvider": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
