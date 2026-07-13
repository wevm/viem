import { expect, test } from 'vitest'

import * as viem from './index.js'

test('exports', () => {
  expect(Object.keys(viem)).toMatchInlineSnapshot(`
    [
      "Account",
      "Actions",
      "erc7821Actions",
      "publicActions",
      "testActions",
      "walletActions",
      "Capabilities",
      "Chain",
      "Client",
      "Contract",
      "ContractError",
      "Errors",
      "NonceManager",
      "RpcError",
      "Token",
      "Transport",
      "custom",
      "fallback",
      "http",
      "loadBalance",
      "rateLimit",
      "webSocket",
    ]
  `)
})
