import { assertType, describe, expect, test, vi } from 'vitest'

import { createTestClient } from './createTestClient'
import { createAdapter } from './adapters/createAdapter'
import { http } from './adapters/http'
import { local } from '../chains'
import { TestRequests } from '../types/eip1193'
import { webSocket } from './adapters/webSocket'

const mockAdapter = createAdapter({
  key: 'mock',
  name: 'Mock Adapter',
  request: <any>vi.fn(() => null),
  type: 'mock',
})

test('creates', () => {
  const { uid, ...client } = createTestClient(mockAdapter, { key: 'anvil' })

  assertType<TestRequests<'anvil'>['request']>(client.request)
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "adapter": {
        "key": "mock",
        "name": "Mock Adapter",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "key": "anvil",
      "name": "Test Client",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "testClient",
    }
  `)
})

describe('adapters', () => {
  test('http', () => {
    const { uid, ...client } = createTestClient(http({ chain: local }), {
      key: 'anvil',
    })

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
        "key": "anvil",
        "name": "Test Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "testClient",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createTestClient(webSocket({ chain: local }), {
      key: 'anvil',
    })

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
        "key": "anvil",
        "name": "Test Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "testClient",
      }
    `)
  })
})
