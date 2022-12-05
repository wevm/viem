import { assertType, describe, expect, test, vi } from 'vitest'

import { createAdapter, ethereumProvider, http, webSocket } from './adapters'
import { local } from '../chains'
import { Requests } from '../types/eip1193'

import { createClient } from './createClient'

test('creates', () => {
  const mockAdapter = createAdapter({
    key: 'mock',
    name: 'Mock Adapter',
    request: vi.fn(async () => null) as unknown as Requests['request'],
    type: 'mock',
  })
  const { uid, ...client } = createClient(mockAdapter)

  assertType<Requests['request']>(client.request)
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "adapter": {
        "key": "mock",
        "name": "Mock Adapter",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "key": "base",
      "name": "Base Client",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "base",
    }
  `)
})

describe('adapters', () => {
  test('http', () => {
    const { uid, ...client } = createClient(http({ chain: local }))

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
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "base",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createClient(webSocket({ chain: local }))

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
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "base",
      }
    `)
  })

  test('ethereumProvider', () => {
    const { uid, ...client } = createClient(
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
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "base",
      }
    `)
  })
})

describe('config', () => {
  test('key', () => {
    const mockAdapter = createAdapter({
      key: 'mock',
      name: 'Mock Adapter',
      request: vi.fn(async () => null) as unknown as Requests['request'],
      type: 'mock',
    })
    const { uid, ...client } = createClient(mockAdapter, {
      key: 'bar',
    })

    assertType<Requests['request']>(client.request)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "adapter": {
          "key": "mock",
          "name": "Mock Adapter",
          "request": [MockFunction spy],
          "type": "mock",
        },
        "key": "bar",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "base",
      }
    `)
  })

  test('name', () => {
    const mockAdapter = createAdapter({
      key: 'mock',
      name: 'Mock Adapter',
      request: vi.fn(async () => null) as unknown as Requests['request'],
      type: 'mock',
    })
    const { uid, ...client } = createClient(mockAdapter, {
      name: 'Mock Client',
    })

    assertType<Requests['request']>(client.request)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "adapter": {
          "key": "mock",
          "name": "Mock Adapter",
          "request": [MockFunction spy],
          "type": "mock",
        },
        "key": "base",
        "name": "Mock Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "base",
      }
    `)
  })

  test('pollingInterval', () => {
    const mockAdapter = createAdapter({
      key: 'mock',
      name: 'Mock Adapter',
      request: vi.fn(async () => null) as unknown as Requests['request'],
      type: 'mock',
    })
    const { uid, ...client } = createClient(mockAdapter, {
      pollingInterval: 10_000,
    })

    assertType<Requests['request']>(client.request)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "adapter": {
          "key": "mock",
          "name": "Mock Adapter",
          "request": [MockFunction spy],
          "type": "mock",
        },
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 10000,
        "request": [Function],
        "type": "base",
      }
    `)
  })

  test('type', () => {
    const mockAdapter = createAdapter({
      key: 'mock',
      name: 'Mock Adapter',
      request: vi.fn(async () => null) as unknown as Requests['request'],
      type: 'mock',
    })
    const { uid, ...client } = createClient(mockAdapter, { type: 'foo' })

    assertType<Requests['request']>(client.request)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "adapter": {
          "key": "mock",
          "name": "Mock Adapter",
          "request": [MockFunction spy],
          "type": "mock",
        },
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "foo",
      }
    `)
  })
})
