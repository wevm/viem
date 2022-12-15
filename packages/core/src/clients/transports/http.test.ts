import { assertType, describe, expect, test } from 'vitest'

import * as chains from '../../chains'

import { http } from './http'

test('default', () => {
  const transport = http({
    chain: chains.localhost,
  })

  assertType<'http'>(transport.config.type)
  expect(transport).toMatchInlineSnapshot(`
    {
      "config": {
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
          },
        },
        "key": "http",
        "name": "HTTP JSON-RPC",
        "request": [Function],
        "type": "http",
      },
      "value": {
        "url": "http://127.0.0.1:8545",
      },
    }
  `)
})

describe('config', () => {
  test('key', () => {
    const transport = http({
      chain: chains.localhost,
      key: 'mock',
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
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
            },
          },
          "key": "mock",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "type": "http",
        },
        "value": {
          "url": "http://127.0.0.1:8545",
        },
      }
    `)
  })

  test('name', () => {
    const transport = http({
      chain: chains.localhost,
      name: 'Mock Transport',
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
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
            },
          },
          "key": "http",
          "name": "Mock Transport",
          "request": [Function],
          "type": "http",
        },
        "value": {
          "url": "http://127.0.0.1:8545",
        },
      }
    `)
  })

  test('url', () => {
    const transport = http({
      chain: chains.localhost,
      url: 'https://mockapi.com/rpc',
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
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
            },
          },
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "type": "http",
        },
        "value": {
          "url": "https://mockapi.com/rpc",
        },
      }
    `)
  })
})

test('request', async () => {
  const transport = http({
    chain: chains.localhost,
    key: 'jsonRpc',
    name: 'JSON RPC',
  })

  expect(
    await transport.config.request({ method: 'eth_blockNumber' }),
  ).toBeDefined()
})
