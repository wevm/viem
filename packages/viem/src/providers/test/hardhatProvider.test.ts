import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { hardhatProvider } from './hardhatProvider'

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
          "default": "http://127.0.0.1:8545",
          "local": "http://127.0.0.1:8545",
        },
      },
      "chains": [
        {
          "id": 1337,
          "name": "Localhost",
          "network": "localhost",
          "rpcUrls": {
            "default": "http://127.0.0.1:8545",
            "local": "http://127.0.0.1:8545",
          },
        },
      ],
      "id": "hardhat",
      "name": "Hardhat",
      "request": [Function],
      "type": "testProvider",
    }
  `)
})
