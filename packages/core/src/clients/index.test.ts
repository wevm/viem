import { expect, test } from 'vitest'

import * as clients from './index'

test('exports clients', () => {
  expect(clients).toMatchInlineSnapshot(`
    {
      "UrlRequiredError": [Function],
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
