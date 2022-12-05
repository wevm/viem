import { assertType, describe, expect, test, vi } from 'vitest'

import { createNetworkClient } from './createNetworkClient'
import { createAdapter } from './adapters/createAdapter'
import { http } from './adapters/http'
import { ethereumProvider } from './adapters/ethereumProvider'
import { webSocket } from './adapters/webSocket'
import { local } from '../chains'
import { PublicRequests } from '../types/eip1193'

const mockAdapter = createAdapter({
  key: 'mock',
  name: 'Mock Adapter',
  request: <any>vi.fn(() => null),
  type: 'mock',
})

test('creates', () => {
  const { uid, ...client } = createNetworkClient(mockAdapter)

  assertType<PublicRequests['request']>(client.request)
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "adapter": {
        "key": "mock",
        "name": "Mock Adapter",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "key": "network",
      "name": "Network Client",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "networkClient",
    }
  `)
})

describe('adapters', () => {
  test('http', () => {
    const { uid, ...client } = createNetworkClient(http({ chain: local }))

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "adapter": {
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
              "local": {
                "http": "http://127.0.0.1:8545",
                "webSocket": "ws://127.0.0.1:8545",
              },
            },
          },
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "transportMode": "http",
          "type": "network",
          "url": "http://127.0.0.1:8545",
        },
        "key": "network",
        "name": "Network Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "networkClient",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createNetworkClient(webSocket({ chain: local }))

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "adapter": {
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
              "local": {
                "http": "http://127.0.0.1:8545",
                "webSocket": "ws://127.0.0.1:8545",
              },
            },
          },
          "getSocket": [Function],
          "key": "webSocket",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "subscribe": [Function],
          "transportMode": "webSocket",
          "type": "network",
        },
        "key": "network",
        "name": "Network Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "networkClient",
      }
    `)
  })

  test('ethereumProvider', () => {
    const { uid, ...client } = createNetworkClient(
      ethereumProvider({ provider: { request: async () => null } }),
    )

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "adapter": {
          "key": "ethereumProvider",
          "name": "Ethereum Provider",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "key": "network",
        "name": "Network Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "networkClient",
      }
    `)
  })
})
