import { assertType, describe, expect, test, vi } from 'vitest'

import { createPublicClient } from './createPublicClient'
import { createTransport } from './transports/createTransport'
import { http } from './transports/http'
import { ethereumProvider } from './transports/ethereumProvider'
import { webSocket } from './transports/webSocket'
import { local } from '../chains'
import { PublicRequests } from '../types/eip1193'

const mockTransport = createTransport({
  key: 'mock',
  name: 'Mock Transport',
  request: <any>vi.fn(() => null),
  type: 'mock',
})

test('creates', () => {
  const { uid, ...client } = createPublicClient(mockTransport)

  assertType<PublicRequests['request']>(client.request)
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "key": "public",
      "name": "Public Client",
      "pollingInterval": 4000,
      "request": [Function],
      "transport": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "type": "publicClient",
    }
  `)
})

describe('transports', () => {
  test('http', () => {
    const { uid, ...client } = createPublicClient(http({ chain: local }))

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "key": "public",
        "name": "Public Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
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
          "type": "http",
          "url": "http://127.0.0.1:8545",
        },
        "type": "publicClient",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createPublicClient(webSocket({ chain: local }))

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "key": "public",
        "name": "Public Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
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
          "type": "webSocket",
        },
        "type": "publicClient",
      }
    `)
  })

  test('ethereumProvider', () => {
    const { uid, ...client } = createPublicClient(
      ethereumProvider({ provider: { request: async () => null } }),
    )

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "key": "public",
        "name": "Public Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "ethereumProvider",
          "name": "Ethereum Provider",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "type": "publicClient",
      }
    `)
  })
})
