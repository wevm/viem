import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { anvilProvider } from './anvilProvider'

test('creates', async () => {
  const provider = anvilProvider({
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
      "id": "anvil",
      "name": "Anvil",
      "request": [Function],
      "type": "testProvider",
    }
  `)
})

test('request', async () => {
  const provider = anvilProvider({
    chain: chains.local,
  })

  expect(await provider.request({ method: 'anvil_getAutomine' })).toBeDefined()
})
