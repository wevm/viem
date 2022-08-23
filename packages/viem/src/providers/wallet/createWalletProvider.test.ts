import { expect, test } from 'vitest'

import { local } from '../../chains'

import { createWalletProvider } from './createWalletProvider'

test('creates', () => {
  const provider = createWalletProvider({
    chains: [local],
    key: 'wallet',
    name: 'Wallet',
    on: <any>(async () => null),
    removeListener: <any>(async () => null),
    request: <any>(async () => null),
    uniqueId: 'wallet',
  })
  expect(provider).toMatchInlineSnapshot(`
    {
      "chains": [
        {
          "id": 1337,
          "name": "Localhost",
          "network": "localhost",
          "rpcUrls": {
            "default": {
              "http": "http://127.0.0.1:8545",
              "webSocket": "ws://127.0.0.1:8545",
            },
            "local": {
              "http": "http://127.0.0.1:8545",
              "webSocket": "ws://127.0.0.1:8545",
            },
          },
        },
      ],
      "key": "wallet",
      "name": "Wallet",
      "on": [Function],
      "pollingInterval": 4000,
      "removeListener": [Function],
      "request": [Function],
      "type": "walletProvider",
      "uniqueId": "wallet",
    }
  `)
})
