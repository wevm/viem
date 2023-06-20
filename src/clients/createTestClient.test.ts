import { assertType, describe, expect, test, vi } from 'vitest'

import { localWsUrl } from '../_test/constants.js'
import { localhost } from '../chains.js'

import { type EIP1193RequestFn, type TestRpcSchema } from '../index.js'
import { createTestClient } from './createTestClient.js'
import { createTransport } from './transports/createTransport.js'
import { http } from './transports/http.js'
import { webSocket } from './transports/webSocket.js'

const mockTransport = () =>
  createTransport({
    key: 'mock',
    name: 'Mock Transport',
    request: vi.fn(() => null) as any,
    type: 'mock',
  })

test('creates', () => {
  const { uid, ...client } = createTestClient({
    mode: 'anvil',
    transport: mockTransport,
  })

  assertType<EIP1193RequestFn<TestRpcSchema<'anvil'>>>(client.request)
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "chain": undefined,
      "dropTransaction": [Function],
      "getAutomine": [Function],
      "getTxpoolContent": [Function],
      "getTxpoolStatus": [Function],
      "impersonateAccount": [Function],
      "increaseTime": [Function],
      "inspectTxpool": [Function],
      "key": "test",
      "mine": [Function],
      "mode": "anvil",
      "name": "Test Client",
      "pollingInterval": 4000,
      "removeBlockTimestampInterval": [Function],
      "request": [Function],
      "reset": [Function],
      "revert": [Function],
      "sendUnsignedTransaction": [Function],
      "setAutomine": [Function],
      "setBalance": [Function],
      "setBlockGasLimit": [Function],
      "setBlockTimestampInterval": [Function],
      "setCode": [Function],
      "setCoinbase": [Function],
      "setIntervalMining": [Function],
      "setLoggingEnabled": [Function],
      "setMinGasPrice": [Function],
      "setNextBlockBaseFeePerGas": [Function],
      "setNextBlockTimestamp": [Function],
      "setNonce": [Function],
      "setRpcUrl": [Function],
      "setStorageAt": [Function],
      "snapshot": [Function],
      "stopImpersonatingAccount": [Function],
      "transport": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "mock",
      },
      "type": "testClient",
    }
  `)
})

describe('transports', () => {
  test('http', () => {
    const { uid, ...client } = createTestClient({
      chain: localhost,
      mode: 'anvil',
      transport: http(),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "chain": {
          "formatters": undefined,
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
          "serializers": undefined,
        },
        "dropTransaction": [Function],
        "getAutomine": [Function],
        "getTxpoolContent": [Function],
        "getTxpoolStatus": [Function],
        "impersonateAccount": [Function],
        "increaseTime": [Function],
        "inspectTxpool": [Function],
        "key": "test",
        "mine": [Function],
        "mode": "anvil",
        "name": "Test Client",
        "pollingInterval": 4000,
        "removeBlockTimestampInterval": [Function],
        "request": [Function],
        "reset": [Function],
        "revert": [Function],
        "sendUnsignedTransaction": [Function],
        "setAutomine": [Function],
        "setBalance": [Function],
        "setBlockGasLimit": [Function],
        "setBlockTimestampInterval": [Function],
        "setCode": [Function],
        "setCoinbase": [Function],
        "setIntervalMining": [Function],
        "setLoggingEnabled": [Function],
        "setMinGasPrice": [Function],
        "setNextBlockBaseFeePerGas": [Function],
        "setNextBlockTimestamp": [Function],
        "setNonce": [Function],
        "setRpcUrl": [Function],
        "setStorageAt": [Function],
        "snapshot": [Function],
        "stopImpersonatingAccount": [Function],
        "transport": {
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
          "url": undefined,
        },
        "type": "testClient",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createTestClient({
      chain: localhost,
      mode: 'anvil',
      transport: webSocket(localWsUrl),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "chain": {
          "formatters": undefined,
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
          "serializers": undefined,
        },
        "dropTransaction": [Function],
        "getAutomine": [Function],
        "getTxpoolContent": [Function],
        "getTxpoolStatus": [Function],
        "impersonateAccount": [Function],
        "increaseTime": [Function],
        "inspectTxpool": [Function],
        "key": "test",
        "mine": [Function],
        "mode": "anvil",
        "name": "Test Client",
        "pollingInterval": 4000,
        "removeBlockTimestampInterval": [Function],
        "request": [Function],
        "reset": [Function],
        "revert": [Function],
        "sendUnsignedTransaction": [Function],
        "setAutomine": [Function],
        "setBalance": [Function],
        "setBlockGasLimit": [Function],
        "setBlockTimestampInterval": [Function],
        "setCode": [Function],
        "setCoinbase": [Function],
        "setIntervalMining": [Function],
        "setLoggingEnabled": [Function],
        "setMinGasPrice": [Function],
        "setNextBlockBaseFeePerGas": [Function],
        "setNextBlockTimestamp": [Function],
        "setNonce": [Function],
        "setRpcUrl": [Function],
        "setStorageAt": [Function],
        "snapshot": [Function],
        "stopImpersonatingAccount": [Function],
        "transport": {
          "getSocket": [Function],
          "key": "webSocket",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "subscribe": [Function],
          "timeout": 10000,
          "type": "webSocket",
        },
        "type": "testClient",
      }
    `)
  })
})
