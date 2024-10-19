import { assertType, describe, expect, test, vi } from 'vitest'

import { anvilMainnet } from '../../test/src/anvil.js'
import { localhost, mainnet } from '../chains/index.js'
import type { EIP1193RequestFn, EIP1474Methods } from '../types/eip1193.js'
import { getAction } from '../utils/getAction.js'
import { type Client, createClient } from './createClient.js'
import { publicActions } from './decorators/public.js'
import { createTransport } from './transports/createTransport.js'
import { custom } from './transports/custom.js'
import { http } from './transports/http.js'
import { webSocket } from './transports/webSocket.js'

test('creates', () => {
  const mockTransport = () =>
    createTransport({
      key: 'mock',
      name: 'Mock Transport',
      request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
      type: 'mock',
    })
  const { uid, ...client } = createClient({
    transport: mockTransport,
  })

  assertType<EIP1193RequestFn<EIP1474Methods>>(client.request)

  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "batch": undefined,
      "cacheTime": 4000,
      "ccipRead": undefined,
      "chain": undefined,
      "extend": [Function],
      "key": "base",
      "name": "Base Client",
      "pollingInterval": 4000,
      "request": [Function],
      "transport": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "mock",
      },
      "type": "base",
    }
  `)
})

describe('transports', () => {
  test('http', () => {
    const { uid, ...client } = createClient({
      chain: localhost,
      transport: http(),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": {
          "fees": undefined,
          "formatters": undefined,
          "id": 1337,
          "name": "Localhost",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Ether",
            "symbol": "ETH",
          },
          "rpcUrls": {
            "default": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
          },
          "serializers": undefined,
        },
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "fetchOptions": undefined,
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
          "url": "http://127.0.0.1:8545",
        },
        "type": "base",
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createClient({
      chain: localhost,
      transport: webSocket(anvilMainnet.rpcUrl.ws),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": {
          "fees": undefined,
          "formatters": undefined,
          "id": 1337,
          "name": "Localhost",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Ether",
            "symbol": "ETH",
          },
          "rpcUrls": {
            "default": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
          },
          "serializers": undefined,
        },
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "getRpcClient": [Function],
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
        "type": "base",
      }
    `)
  })

  test('custom', () => {
    const { uid, ...client } = createClient({
      transport: custom({ request: async () => null }),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "custom",
          "name": "Custom Provider",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "custom",
        },
        "type": "base",
      }
    `)
  })
})

describe('config', () => {
  test('cacheTime', () => {
    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
        type: 'mock',
      })
    const { uid, ...client } = createClient({
      cacheTime: 10_000,
      transport: mockTransport,
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 10000,
        "ccipRead": undefined,
        "chain": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "mock",
          "name": "Mock Transport",
          "request": [MockFunction spy],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "base",
      }
    `)
  })

  test('ccipRead', () => {
    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
        type: 'mock',
      })
    const { uid, ...client } = createClient({
      ccipRead: {
        async request(_parameters) {
          return '0x' as const
        },
      },
      transport: mockTransport,
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": {
          "request": [Function],
        },
        "chain": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "mock",
          "name": "Mock Transport",
          "request": [MockFunction spy],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "base",
      }
    `)
  })

  test('key', () => {
    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
        type: 'mock',
      })
    const { uid, ...client } = createClient({
      key: 'bar',
      transport: mockTransport,
    })

    assertType<EIP1193RequestFn<EIP1474Methods>>(client.request)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "extend": [Function],
        "key": "bar",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "mock",
          "name": "Mock Transport",
          "request": [MockFunction spy],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "base",
      }
    `)
  })

  test('name', () => {
    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
        type: 'mock',
      })
    const { uid, ...client } = createClient({
      name: 'Mock Client',
      transport: mockTransport,
    })

    assertType<EIP1193RequestFn<EIP1474Methods>>(client.request)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Mock Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "mock",
          "name": "Mock Transport",
          "request": [MockFunction spy],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "base",
      }
    `)
  })

  test('pollingInterval', () => {
    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
        type: 'mock',
      })
    const { uid, ...client } = createClient({
      pollingInterval: 10_000,
      transport: mockTransport,
    })

    assertType<EIP1193RequestFn<EIP1474Methods>>(client.request)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 10000,
        "ccipRead": undefined,
        "chain": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 10000,
        "request": [Function],
        "transport": {
          "key": "mock",
          "name": "Mock Transport",
          "request": [MockFunction spy],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "base",
      }
    `)
  })

  test('type', () => {
    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
        type: 'mock',
      })
    const { uid, ...client } = createClient({
      transport: mockTransport,
      type: 'foo',
    })

    assertType<EIP1193RequestFn<EIP1474Methods>>(client.request)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "mock",
          "name": "Mock Transport",
          "request": [MockFunction spy],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "foo",
      }
    `)
  })
})

describe('extends', () => {
  test('default', async () => {
    const client = createClient({
      chain: localhost,
      transport: http(),
    }).extend((config) => ({
      getChainId: async () => config.chain.id,
    }))

    expect(await client.getChainId()).toEqual(client.chain.id)
  })

  test('public actions', () => {
    const { uid: _, ...client } = createClient({
      chain: localhost,
      transport: http(),
    }).extend(publicActions)

    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "call": [Function],
        "ccipRead": undefined,
        "chain": {
          "fees": undefined,
          "formatters": undefined,
          "id": 1337,
          "name": "Localhost",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Ether",
            "symbol": "ETH",
          },
          "rpcUrls": {
            "default": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
          },
          "serializers": undefined,
        },
        "createBlockFilter": [Function],
        "createContractEventFilter": [Function],
        "createEventFilter": [Function],
        "createPendingTransactionFilter": [Function],
        "estimateContractGas": [Function],
        "estimateFeesPerGas": [Function],
        "estimateGas": [Function],
        "estimateMaxPriorityFeePerGas": [Function],
        "extend": [Function],
        "getBalance": [Function],
        "getBlobBaseFee": [Function],
        "getBlock": [Function],
        "getBlockNumber": [Function],
        "getBlockTransactionCount": [Function],
        "getBytecode": [Function],
        "getChainId": [Function],
        "getCode": [Function],
        "getContractEvents": [Function],
        "getEip712Domain": [Function],
        "getEnsAddress": [Function],
        "getEnsAvatar": [Function],
        "getEnsName": [Function],
        "getEnsResolver": [Function],
        "getEnsText": [Function],
        "getFeeHistory": [Function],
        "getFilterChanges": [Function],
        "getFilterLogs": [Function],
        "getGasPrice": [Function],
        "getLogs": [Function],
        "getProof": [Function],
        "getStorageAt": [Function],
        "getTransaction": [Function],
        "getTransactionConfirmations": [Function],
        "getTransactionCount": [Function],
        "getTransactionReceipt": [Function],
        "key": "base",
        "multicall": [Function],
        "name": "Base Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "readContract": [Function],
        "request": [Function],
        "sendRawTransaction": [Function],
        "simulateContract": [Function],
        "transport": {
          "fetchOptions": undefined,
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
          "url": "http://127.0.0.1:8545",
        },
        "type": "base",
        "uninstallFilter": [Function],
        "verifyMessage": [Function],
        "verifySiweMessage": [Function],
        "verifyTypedData": [Function],
        "waitForTransactionReceipt": [Function],
        "watchBlockNumber": [Function],
        "watchBlocks": [Function],
        "watchContractEvent": [Function],
        "watchEvent": [Function],
        "watchPendingTransactions": [Function],
      }
    `)
  })

  describe('ignores protected properties', () => {
    test('default', () => {
      const client = createClient({
        chain: localhost,
        transport: http(),
      })
      const extended = client.extend(() => ({
        // @ts-expect-error
        chain: mainnet,
      }))

      // @ts-expect-error
      expect(extended.chain.id).toEqual(client.chain.id)
    })
  })

  test('action composition', async () => {
    let calls: string[] = []

    async function getChainId(_client: Client) {
      calls.push('getChainId:base')
      return 1337
    }

    async function estimateGas(client: Client) {
      calls.push('estimateGas:base')
      await getAction(client, getChainId, 'getChainId')({})
      return 1000n
    }

    const extended = createClient({
      chain: localhost,
      transport: http(),
    })
      .extend((client) => ({
        getChainId: () => getChainId(client),
        estimateGas: () => estimateGas(client),
      }))
      .extend((client) => ({
        async getChainId() {
          calls.push('getChainId:first')
          return getAction(client, getChainId, 'getChainId')({})
        },
        async estimateGas() {
          calls.push('estimateGas:first')
          return getAction(client, estimateGas, 'estimateGas')({})
        },
      }))
      .extend((client) => ({
        async getChainId() {
          calls.push('getChainId:second')
          return getAction(client, getChainId, 'getChainId')({})
        },
        async estimateGas() {
          calls.push('estimateGas:second')
          return getAction(client, estimateGas, 'estimateGas')({})
        },
      }))

    expect(await extended.getChainId()).toBe(1337)
    expect(calls).toEqual([
      'getChainId:second',
      'getChainId:first',
      'getChainId:base',
    ])

    calls = []
    expect(await extended.estimateGas()).toBe(1000n)
    expect(calls).toEqual([
      'estimateGas:second',
      'estimateGas:first',
      'estimateGas:base',
      'getChainId:base',
    ])
  })
})
