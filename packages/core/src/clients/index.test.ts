import { expect, test } from 'vitest'

import * as rpcs from './index'

test('exports rpcs', () => {
  expect(rpcs).toMatchInlineSnapshot(`
    {
      "createAdapter": [Function],
      "createClient": [Function],
      "createNetworkClient": [Function],
      "createTestClient": [Function],
      "createWalletClient": [Function],
      "ethereumProvider": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
