import { assertType, describe, expect, test, vi } from 'vitest'

import { createWalletClient } from './createWalletClient'
import { createTransport } from './transports/createTransport'
import { http } from './transports/http'
import { webSocket } from './transports/webSocket'
import { localhost } from '../chains'
import type { SignableRequests, WalletRequests } from '../types/eip1193'
import { custom } from './transports/custom'
import { localWsUrl } from '../_test'

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
      "addChain": [Function],
      "chain": undefined,
      "deployContract": [Function],
      "getAccounts": [Function],
      "getPermissions": [Function],
      "key": "wallet",
      "name": "Wallet Client",
      "pollingInterval": 4000,
      "request": [Function],
      "requestAccounts": [Function],
      "requestPermissions": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
      "switchChain": [Function],
      "transport": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "mock",
      },
      "type": "walletClient",
      "watchAsset": [Function],
      "writeContract": [Function],
    }
  `)
})

describe('transports', () => {
  test('custom', () => {
    const { uid, ...client } = createWalletClient({
      transport: custom({ request: async () => null }),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "addChain": [Function],
        "chain": undefined,
        "deployContract": [Function],
        "getAccounts": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "requestAccounts": [Function],
        "requestPermissions": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "switchChain": [Function],
        "transport": {
          "key": "custom",
          "name": "Custom Provider",
          "request": [Function],
          "retryCount": 0,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "custom",
        },
        "type": "walletClient",
        "watchAsset": [Function],
        "writeContract": [Function],
      }
    `)
  })

  test('http', () => {
    const { uid, ...client } = createWalletClient({
      transport: http('https://mockapi.com/rpc'),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "addChain": [Function],
        "chain": undefined,
        "deployContract": [Function],
        "getAccounts": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "requestAccounts": [Function],
        "requestPermissions": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "switchChain": [Function],
        "transport": {
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 0,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
          "url": "https://mockapi.com/rpc",
        },
        "type": "walletClient",
        "watchAsset": [Function],
        "writeContract": [Function],
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createWalletClient({
      chain: localhost,
      transport: webSocket(localWsUrl),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "addChain": [Function],
        "chain": undefined,
        "deployContract": [Function],
        "getAccounts": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "requestAccounts": [Function],
        "requestPermissions": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "switchChain": [Function],
        "transport": {
          "getSocket": [Function],
          "key": "webSocket",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "retryCount": 0,
          "retryDelay": 150,
          "subscribe": [Function],
          "timeout": 10000,
          "type": "webSocket",
        },
        "type": "walletClient",
        "watchAsset": [Function],
        "writeContract": [Function],
      }
    `)
  })
})
