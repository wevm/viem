import { assertType, describe, expect, test } from 'vitest'

import * as chains from '../../chains'

import { http } from './http'

test('default', () => {
  const transport = http({
    chain: chains.local,
  })

  assertType<'http'>(transport.config.type)
  expect(transport).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "http",
        "name": "HTTP JSON-RPC",
        "request": [Function],
        "type": "http",
      },
      "value": {
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
        "url": "http://127.0.0.1:8545",
      },
    }
  `)
})

describe('config', () => {
  test('key', () => {
    const transport = http({
      chain: chains.local,
      key: 'mock',
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "type": "http",
        },
        "value": {
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
          "url": "http://127.0.0.1:8545",
        },
      }
    `)
  })

  test('name', () => {
    const transport = http({
      chain: chains.local,
      name: 'Mock Transport',
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "http",
          "name": "Mock Transport",
          "request": [Function],
          "type": "http",
        },
        "value": {
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
          "url": "http://127.0.0.1:8545",
        },
      }
    `)
  })

  test('url', () => {
    const transport = http({
      chain: chains.local,
      url: 'https://mockapi.com/rpc',
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "type": "http",
        },
        "value": {
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
          "url": "https://mockapi.com/rpc",
        },
      }
    `)
  })
})

/* eslint-disable import/namespace */
Object.keys(chains).forEach((key) => {
  if (key === 'local') return

  // @ts-expect-error – testing
  const chain = chains[key]
  test(`request (${key})`, async () => {
    const transport = http({
      chain,
      url: chain.rpcUrls.default.http,
    })

    expect(
      await transport.config.request({ method: 'eth_blockNumber' }),
    ).toBeDefined()
  })
})

test('request (local)', async () => {
  const transport = http({
    chain: chains.local,
    key: 'jsonRpc',
    name: 'JSON RPC',
  })

  expect(
    await transport.config.request({ method: 'eth_blockNumber' }),
  ).toBeDefined()
})
/* eslint-enable import/namespace */
