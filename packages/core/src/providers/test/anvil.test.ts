import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { anvilProvider } from './anvil'

test('creates', async () => {
  const provider = anvilProvider({
    chain: chains.local,
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "chain": {
        "blockTime": 1000,
        "id": 1337,
        "name": "Localhost",
        "network": "localhost",
        "rpcUrls": {
          "default": {
            "http": "http://127.0.0.1:8545",
            "webSocket": "ws://127.0.0.1:8545",
          },
          "local": "http://127.0.0.1:8545",
        },
      },
      "chains": [
        {
          "blockTime": 1000,
          "id": 1337,
          "name": "Localhost",
          "network": "localhost",
          "rpcUrls": {
            "default": {
              "http": "http://127.0.0.1:8545",
              "webSocket": "ws://127.0.0.1:8545",
            },
            "local": "http://127.0.0.1:8545",
          },
        },
      ],
      "key": "anvil",
      "name": "Anvil",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "testProvider",
      "uniqueId": "anvil.1337",
    }
  `)
})
