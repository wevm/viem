import { assertType, describe, expect, test, vi } from 'vitest'

import { localhost } from '../chains'
import type { JsonRpcAccount, LocalAccount } from '../types'
import type { SignableRequests, WalletRequests } from '../types/eip1193'
import { accounts, getLocalAccount, localWsUrl } from '../_test'
import { createWalletClient } from './createWalletClient'
import { createTransport } from './transports/createTransport'
import { custom } from './transports/custom'
import { http } from './transports/http'
import { webSocket } from './transports/webSocket'

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
  assertType<{
    account?: undefined
  }>(client)
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "addChain": [Function],
      "chain": undefined,
      "deployContract": [Function],
      "getAddresses": [Function],
      "getChainId": [Function],
      "getPermissions": [Function],
      "key": "wallet",
      "name": "Wallet Client",
      "pollingInterval": 4000,
      "request": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
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

describe('args: account', () => {
  test('json-rpc account', () => {
    const { uid, ...client } = createWalletClient({
      account: accounts[0].address,
      transport: mockTransport,
    })
    assertType<{
      account: JsonRpcAccount
    }>(client)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "type": "json-rpc",
        },
        "addChain": [Function],
        "chain": undefined,
        "deployContract": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTypedData": [Function],
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

  test('local account', () => {
    const { uid, ...client } = createWalletClient({
      account: getLocalAccount(accounts[0].privateKey),
      transport: mockTransport,
    })
    assertType<{
      account: LocalAccount
    }>(client)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "type": "local",
        },
        "addChain": [Function],
        "chain": undefined,
        "deployContract": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTypedData": [Function],
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
})

describe('args: transport', () => {
  test('custom', () => {
    const { uid, ...client } = createWalletClient({
      transport: custom({ request: async () => null }),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "addChain": [Function],
        "chain": undefined,
        "deployContract": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTypedData": [Function],
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
        "account": undefined,
        "addChain": [Function],
        "chain": undefined,
        "deployContract": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTypedData": [Function],
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
        "account": undefined,
        "addChain": [Function],
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
            "public": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
          },
        },
        "deployContract": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTypedData": [Function],
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
