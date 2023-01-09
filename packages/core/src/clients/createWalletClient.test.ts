import { assertType, describe, expect, test, vi } from 'vitest'

import { createWalletClient } from './createWalletClient'
import { createTransport } from './transports/createTransport'
import { http } from './transports/http'
import { webSocket } from './transports/webSocket'
import { localhost } from '../chains'
import type { SignableRequests, WalletRequests } from '../types/eip1193'
import { ethereumProvider } from './transports/ethereumProvider'
import { localWsUrl } from '../../test'

const mockTransport = () =>
  createTransport({
    key: 'mock',
    name: 'Mock Transport',
    request: vi.fn(() => null) as any,
    type: 'mock',
  })

test('creates', () => {
  const { uid, ...client } = createWalletClient({ transport: mockTransport })

  assertType<SignableRequests['request'] & WalletRequests['request']>(
    client.request,
  )
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "chain": undefined,
      "key": "wallet",
      "name": "Wallet Client",
      "pollingInterval": 4000,
      "request": [Function],
      "transport": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "type": "walletClient",
    }
  `)
})

describe('transports', () => {
  test('ethereumProvider', () => {
    const { uid, ...client } = createWalletClient({
      transport: ethereumProvider({ provider: { request: async () => null } }),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "chain": undefined,
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "ethereumProvider",
          "name": "Ethereum Provider",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "type": "walletClient",
      }
    `)
  })

  test('http', () => {
    const { uid, ...client } = createWalletClient({
      transport: http({ url: 'https://mockapi.com/rpc' }),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "chain": undefined,
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "type": "http",
          "url": "https://mockapi.com/rpc",
        },
        "type": "walletClient",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createWalletClient({
      chain: localhost,
      transport: webSocket({ url: localWsUrl }),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "chain": undefined,
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "getSocket": [Function],
          "key": "webSocket",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "subscribe": [Function],
          "type": "webSocket",
        },
        "type": "walletClient",
      }
    `)
  })
})
