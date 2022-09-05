/* eslint-disable import/namespace */
import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { wait } from '../../utils/wait'
import { webSocketProvider } from './webSocket'

test('creates', async () => {
  const provider = webSocketProvider({
    chain: chains.local,
  })

  expect(provider).toMatchInlineSnapshot(`
    {
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
      "chains": [
        {
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
      ],
      "getSocket": [Function],
      "key": "webSocket",
      "name": "WebSocket JSON-RPC",
      "pollingInterval": 4000,
      "request": [Function],
      "subscribe": [Function],
      "transportMode": "webSocket",
      "type": "networkProvider",
      "uniqueId": "webSocket.1337.webSocket",
    }
  `)
})

test('getSocket', async () => {
  const provider = webSocketProvider({
    chain: chains.local,
  })
  const socket = await provider.getSocket()
  expect(socket).toBeDefined()
  expect(socket.readyState).toBe(WebSocket.OPEN)
})

Object.keys(chains).forEach((key) => {
  if (key === 'local') return

  // @ts-expect-error – testing
  const chain = chains[key]
  if (!chain.rpcUrls.default.webSocket) return
  test(`request (${key})`, async () => {
    const provider = webSocketProvider({
      chain,
      url: chain.rpcUrls.default.webSocket,
    })

    expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
  })
})

test('request (local)', async () => {
  const provider = webSocketProvider({
    chain: chains.local,
    key: 'jsonRpc',
    name: 'JSON RPC',
  })

  expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
})

test('subscribe', async () => {
  const provider = webSocketProvider({
    chain: chains.local,
    key: 'jsonRpc',
    name: 'JSON RPC',
  })

  let blocks: any[] = []
  const { subscriptionId, unsubscribe } = await provider.subscribe({
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
/* eslint-enable import/namespace */

test('throws on bogus subscription', async () => {
  const provider = webSocketProvider({
    chain: chains.local,
    key: 'jsonRpc',
    name: 'JSON RPC',
  })

  let errors: any[] = []
  await expect(() =>
    provider.subscribe({
      // @ts-expect-error - testing
      params: ['lol'],
      onData: () => null,
      onError: (err) => errors.push(err),
    }),
  ).rejects.toThrowError()
  expect(errors.length).toBeGreaterThan(0)
})

test('throws if no url is provided', () => {
  expect(() =>
    webSocketProvider({
      chain: { ...chains.local, rpcUrls: { default: { http: '' } } },
    }),
  ).toThrow('url is required')
})
