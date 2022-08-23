/* eslint-disable import/namespace */
import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { webSocketProvider } from './webSocket'

test('creates', async () => {
  const provider = webSocketProvider({
    chain: chains.local,
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "chain": {
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
      "request": [Function],
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
/* eslint-enable import/namespace */

test('throws if no url is provided', () => {
  expect(() =>
    webSocketProvider({
      chain: { ...chains.local, rpcUrls: { default: { http: '' } } },
    }),
  ).toThrow('url is required')
})
