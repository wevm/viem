import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { hardhatProvider } from './hardhat'

test('creates', async () => {
  const provider = hardhatProvider({
    chain: chains.local,
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "chain": {
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
      "key": "hardhat",
      "name": "Hardhat",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "testProvider",
      "uniqueId": "hardhat.1337",
    }
  `)
})
