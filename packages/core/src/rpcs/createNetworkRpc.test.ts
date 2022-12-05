import { assertType, describe, expect, test, vi } from 'vitest'

import { createNetworkRpc } from './createNetworkRpc'
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
  const { uid, ...rpc } = createNetworkRpc(mockAdapter)

  assertType<PublicRequests['request']>(rpc.request)
  expect(uid).toBeDefined()
  expect(rpc).toMatchInlineSnapshot(`
    {
      "adapter": {
        "key": "mock",
        "name": "Mock Adapter",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "key": "network",
      "name": "Network RPC Client",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "networkRpc",
    }
  `)
})

describe('adapters', () => {
  test('http', () => {
    const { uid, ...rpc } = createNetworkRpc(http({ chain: local }))

    expect(uid).toBeDefined()
    expect(rpc).toMatchInlineSnapshot(`
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
        "name": "Network RPC Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "networkRpc",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...rpc } = createNetworkRpc(webSocket({ chain: local }))

    expect(uid).toBeDefined()
    expect(rpc).toMatchInlineSnapshot(`
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
        "name": "Network RPC Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "networkRpc",
      }
    `)
  })

  test('ethereumProvider', () => {
    const { uid, ...rpc } = createNetworkRpc(
      ethereumProvider({ provider: { request: async () => null } }),
    )

    expect(uid).toBeDefined()
    expect(rpc).toMatchInlineSnapshot(`
      {
        "adapter": {
          "key": "ethereumProvider",
          "name": "Ethereum Provider",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "key": "network",
        "name": "Network RPC Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "networkRpc",
      }
    `)
  })
})
