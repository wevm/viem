import { assertType, describe, expect, test, vi } from 'vitest'

import { createTestClient } from './createTestClient'
import { createTransport } from './transports/createTransport'
import { http } from './transports/http'
import { localhost } from '../chains'
import type { TestRequests } from '../types/eip1193'
import { webSocket } from './transports/webSocket'
import { localWsUrl } from '../_test'

const mockTransport = () =>
  createTransport({
    key: 'mock',
    name: 'Mock Transport',
    request: vi.fn(() => null) as any,
    type: 'mock',
  })

test('creates', () => {
  const { uid, ...client } = createTestClient({
    mode: 'anvil',
    transport: mockTransport,
  })

  assertType<TestRequests<'anvil'>['request']>(client.request)
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "chain": undefined,
      "key": "test",
      "mode": "anvil",
      "name": "Test Client",
      "pollingInterval": 4000,
      "request": [Function],
      "transport": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "retryCount": 3,
        "retryDelay": 150,
        "type": "mock",
      },
      "type": "testClient",
    }
  `)
})

describe('transports', () => {
  test('http', () => {
    const { uid, ...client } = createTestClient({
      chain: localhost,
      mode: 'anvil',
      transport: http(),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "chain": {
          "id": 1337,
          "name": "Localhost",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Ether",
            "symbol": "ETH",
          },
          "network": "localhost",
          "rpcUrls": {
            "default": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
            "public": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
          },
        },
        "key": "test",
        "mode": "anvil",
        "name": "Test Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "type": "http",
          "url": undefined,
        },
        "type": "testClient",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createTestClient({
      chain: localhost,
      mode: 'anvil',
      transport: webSocket(localWsUrl),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "chain": {
          "id": 1337,
          "name": "Localhost",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Ether",
            "symbol": "ETH",
          },
          "network": "localhost",
          "rpcUrls": {
            "default": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
            "public": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
          },
        },
        "key": "test",
        "mode": "anvil",
        "name": "Test Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "getSocket": [Function],
          "key": "webSocket",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "subscribe": [Function],
          "type": "webSocket",
        },
        "type": "testClient",
      }
    `)
  })
})
