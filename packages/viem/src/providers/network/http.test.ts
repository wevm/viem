/* eslint-disable import/namespace */
import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { httpProvider } from './http'

test('creates', async () => {
  const provider = httpProvider({
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
      "id": "http",
      "name": "HTTP JSON-RPC",
      "request": [Function],
      "transportMode": "http",
      "type": "networkProvider",
    }
  `)
})

Object.keys(chains).forEach((key) => {
  if (key === 'local') return

  // @ts-expect-error – testing
  const chain = chains[key]
  test(`request (${key})`, async () => {
    const provider = httpProvider({
      chain,
      url: chain.rpcUrls.default.http,
    })

    expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
  })
})

test('request (local)', async () => {
  const provider = httpProvider({
    chain: chains.local,
    id: 'jsonRpc',
    name: 'JSON RPC',
  })

  expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
})
/* eslint-enable import/namespace */
