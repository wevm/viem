import { assertType, describe, expect, test, vi } from 'vitest'

import { createWalletRpc } from './createWalletRpc'
import { createAdapter } from './adapters/createAdapter'
import { http } from './adapters/http'
import { webSocket } from './adapters/webSocket'
import { local } from '../chains'
import { SignableRequests, WalletRequests } from '../types/eip1193'
import { ethereumProvider } from './adapters/ethereumProvider'

const mockAdapter = createAdapter({
  key: 'mock',
  name: 'Mock Adapter',
  request: <any>vi.fn(() => null),
  type: 'mock',
})

test('creates', () => {
  const { uid, ...rpc } = createWalletRpc(mockAdapter)

  assertType<SignableRequests['request'] & WalletRequests['request']>(
    rpc.request,
  )
  expect(uid).toBeDefined()
  expect(rpc).toMatchInlineSnapshot(`
    {
      "adapter": {
        "key": "mock",
        "name": "Mock Adapter",
        "request": [MockFunction spy],
        "type": "mock",
      },
      "key": "wallet",
      "name": "Wallet RPC Client",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "walletRpc",
    }
  `)
})

describe('adapters', () => {
  test('ethereumProvider', () => {
    const { uid, ...rpc } = createWalletRpc(
      ethereumProvider({ provider: { request: async () => null } }),
    )

    expect(uid).toBeDefined()
    expect(rpc).toMatchInlineSnapshot(`
      {
        "adapter": {
          "key": "ethereumProvider",
          "name": "Ethereum Provider",
          "request": [Function],
          "type": "ethereumProvider",
        },
        "key": "wallet",
        "name": "Wallet RPC Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "walletRpc",
      }
    `)
  })

  test('http', () => {
    const { uid, ...rpc } = createWalletRpc(http({ chain: local }))

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
        "key": "wallet",
        "name": "Wallet RPC Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "walletRpc",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...rpc } = createWalletRpc(webSocket({ chain: local }))

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
        "key": "wallet",
        "name": "Wallet RPC Client",
        "pollingInterval": 4000,
        "request": [Function],
        "type": "walletRpc",
      }
    `)
  })
})
