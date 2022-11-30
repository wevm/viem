import { assertType, describe, expect, test, vi } from 'vitest'

import { createTestRpc } from './createTestRpc'
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
  const { uid, ...rpc } = createTestRpc(mockAdapter, { key: 'anvil' })

  assertType<TestRequests<'anvil'>['request']>(rpc.request)
  expect(uid).toBeDefined()
  expect(rpc).toMatchInlineSnapshot(`
    {
      "adapter": {
        "key": "mock",
        "name": "Mock Adapter",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "key": "anvil",
      "name": "Test RPC Client",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "testRpc",
    }
  `)
})

describe('adapters', () => {
  test('http', () => {
    const { uid, ...rpc } = createTestRpc(http({ chain: local }), {
      key: 'anvil',
    })

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
        "key": "anvil",
        "name": "Test RPC Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "testRpc",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...rpc } = createTestRpc(webSocket({ chain: local }), {
      key: 'anvil',
    })

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
        "key": "anvil",
        "name": "Test RPC Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "testRpc",
      }
    `)
  })
})
