/* eslint-disable import/namespace */
import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { webSocketProvider } from './webSocketProvider'

test('creates', async () => {
  const provider = webSocketProvider({
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
          "local": {
            "http": "http://127.0.0.1:8545",
            "webSocket": "ws://127.0.0.1:8545",
          },
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
            "local": {
              "http": "http://127.0.0.1:8545",
              "webSocket": "ws://127.0.0.1:8545",
            },
          },
        },
      ],
      "id": "webSocket",
      "name": "WebSocket JSON-RPC",
      "request": [Function],
      "type": "networkProvider",
    }
  `)
})

Object.keys(chains).forEach((key) => {
  if (key === 'local') return
  test.todo(`request (${key})`)
})

test('request (local)', async () => {
  const provider = webSocketProvider({
    chain: chains.local,
    id: 'jsonRpc',
    name: 'JSON RPC',
  })

  expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
})
/* eslint-enable import/namespace */

test.todo('throws if http url is provided')
