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
      "Addresses",
      "Capabilities",
      "Chain",
      "Client",
      "Contract",
      "ContractError",
      "Engine",
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
    siwe: typeof viem.Actions.siwe.verify,
    signTypedData: 'signTypedData' in viem.Actions,
    state: typeof viem.Actions.state.reset,
    test: 'test' in viem.Actions,
    typedData: [
      typeof viem.Actions.typedData.sign,
      typeof viem.Actions.typedData.verify,
    ],
    txpool: typeof viem.Actions.txpool.inspect,
    verifySiweMessage: 'verifySiweMessage' in viem.Actions,
    verifyTypedData: 'verifyTypedData' in viem.Actions,
  }).toMatchInlineSnapshot(`
    {
      "address": "function",
      "block": "function",
      "node": "function",
      "signTypedData": false,
      "siwe": "function",
      "state": "function",
      "test": false,
      "txpool": "function",
      "typedData": [
        "function",
        "function",
      ],
      "verifySiweMessage": false,
      "verifyTypedData": false,
    }
  `)
})
