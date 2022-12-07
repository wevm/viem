import { assertType, describe, expect, test } from 'vitest'

import { localWsUrl } from '../../../test/utils'

import * as chains from '../../chains'
import { wait } from '../../utils/wait'

import { webSocket } from './webSocket'

test('default', () => {
  const transport = webSocket({
    chain: chains.localhost,
    url: localWsUrl,
  })

  assertType<'webSocket'>(transport.config.type)
  expect(transport).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "webSocket",
        "name": "WebSocket JSON-RPC",
        "request": [Function],
        "type": "webSocket",
      },
      "value": {
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
        "getSocket": [Function],
        "subscribe": [Function],
      },
    }
  `)
})

describe('config', () => {
  test('key', () => {
    const transport = webSocket({
      chain: chains.localhost,
      key: 'mock',
      url: localWsUrl,
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "type": "webSocket",
        },
        "value": {
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
          "getSocket": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })

  test('name', () => {
    const transport = webSocket({
      chain: chains.localhost,
      name: 'Mock Transport',
      url: localWsUrl,
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "webSocket",
          "name": "Mock Transport",
          "request": [Function],
          "type": "webSocket",
        },
        "value": {
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
          "getSocket": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })

  test('url', () => {
    const transport = webSocket({
      chain: chains.localhost,
      url: 'https://mockapi.com/rpc',
    })

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "webSocket",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "type": "webSocket",
        },
        "value": {
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
          "getSocket": [Function],
          "subscribe": [Function],
        },
      }
    `)
  })
})

test('getSocket', async () => {
  const rpc = webSocket({
    chain: chains.localhost,
    url: localWsUrl,
  })
  const socket = await rpc.value?.getSocket()
  expect(socket).toBeDefined()
  expect(socket?.readyState).toBe(WebSocket.OPEN)
})

test('request', async () => {
  const transport = webSocket({
    chain: chains.localhost,
    key: 'jsonRpc',
    name: 'JSON RPC',
    url: localWsUrl,
  })

  expect(
    await transport.config.request({ method: 'eth_blockNumber' }),
  ).toBeDefined()
})

test('subscribe', async () => {
  const rpc = webSocket({
    chain: chains.localhost,
    key: 'jsonRpc',
    name: 'JSON RPC',
    url: localWsUrl,
  })
  if (!rpc.value) return

  let blocks: any[] = []
  const { subscriptionId, unsubscribe } = await rpc.value.subscribe({
    params: ['newHeads'],
    onData: (data) => blocks.push(data),
  })

  // Make sure we are subscribed.
  expect(subscriptionId).toBeDefined()

  // Make sure we are receiving blocks.
  await wait(2000)
  expect(blocks.length).toBe(2)

  // Make sure we unsubscribe.
  const { result } = await unsubscribe()
  expect(result).toBeDefined()

  // Make sure we are no longer receiving blocks.
  await wait(2000)
  expect(blocks.length).toBe(2)
})

test('throws on bogus subscription', async () => {
  const rpc = webSocket({
    chain: chains.localhost,
    key: 'jsonRpc',
    name: 'JSON RPC',
    url: localWsUrl,
  })

  let errors: any[] = []
  await expect(() =>
    rpc.value?.subscribe({
      // @ts-expect-error - testing
      params: ['lol'],
      onData: () => null,
      onError: (err) => errors.push(err),
    }),
  ).rejects.toThrowError()
  expect(errors.length).toBeGreaterThan(0)
})
