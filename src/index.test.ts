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

test('action categories', () => {
  expect({
    address: typeof viem.Actions.address.impersonate,
    block: typeof viem.Actions.block.mine,
    node: typeof viem.Actions.node.setRpcUrl,
    state: typeof viem.Actions.state.reset,
    test: 'test' in viem.Actions,
    txpool: typeof viem.Actions.txpool.inspect,
  }).toMatchInlineSnapshot(`
    {
      "address": "function",
      "block": "function",
      "node": "function",
      "state": "function",
      "test": false,
      "txpool": "function",
    }
  `)
})
