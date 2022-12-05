import { expect, test } from 'vitest'

import * as rpcs from './index'

test('exports rpcs', () => {
  expect(rpcs).toMatchInlineSnapshot(`
    {
      "createAdapter": [Function],
      "createNetworkRpc": [Function],
      "createRpc": [Function],
      "createTestRpc": [Function],
      "createWalletRpc": [Function],
      "ethereumProvider": [Function],
      "http": [Function],
      "webSocket": [Function],
    }
  `)
})
