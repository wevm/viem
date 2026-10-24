import { assertType, describe, expect, test, vi } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { createHttpServer } from '~test/utils.js'
import { base, localhost, mainnet } from '../chains/index.js'
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
      "dataSuffix": undefined,
      "extend": [Function],
      "key": "base",
      "name": "Base Client",
      "pollingInterval": 4000,
      "request": [Function],
      "scope": [Function],
      "tokens": undefined,
      "transport": {
        "key": "mock",
        "methods": undefined,
        "name": "Mock Transport",
        "request": [MockFunction],
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
          "extend": [Function],
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
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "fetchOptions": undefined,
          "key": "http",
          "methods": undefined,
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
          "extend": [Function],
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
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "getRpcClient": [Function],
          "getSocket": [Function],
          "key": "webSocket",
          "methods": undefined,
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
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "key": "custom",
          "methods": undefined,
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
  test('experimental_blockTag', () => {
    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
        type: 'mock',
      })
    const { uid, ...client } = createClient({
      experimental_blockTag: 'safe',
      transport: mockTransport,
    })

    expect(uid).toBeDefined()
    expect(client.experimental_blockTag).toBe('safe')
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "dataSuffix": undefined,
        "experimental_blockTag": "safe",
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [MockFunction],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "base",
      }
    `)
  })

  test('experimental_blockTag: defaults to pending when chain has `experimental_preconfirmationTime`', () => {
    const mockTransport = () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: vi.fn(async () => null) as unknown as EIP1193RequestFn,
        type: 'mock',
      })
    const mockChain = {
      id: 1337,
      name: 'Mock Chain',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['http://localhost:8545'] } },
      experimental_preconfirmationTime: 1000,
    }
    const { uid, ...client } = createClient({
      chain: mockChain,
      transport: mockTransport,
    })

    expect(uid).toBeDefined()
    expect(client.experimental_blockTag).toBe('pending')
  })

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
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [MockFunction],
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
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [MockFunction],
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
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "bar",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [MockFunction],
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
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Mock Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [MockFunction],
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
        "cacheTime": 6000,
        "ccipRead": undefined,
        "chain": undefined,
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 10000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [MockFunction],
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
        "dataSuffix": undefined,
        "extend": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [MockFunction],
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

test('behavior: cacheTime, pollingInterval based on chain.blockTime', () => {
  const client = createClient({
    chain: base,
    transport: http(),
  })

  expect(client.cacheTime).toEqual(Math.floor(base.blockTime / 2))
  expect(client.pollingInterval).toEqual(Math.floor(base.blockTime / 2))
})

test('behavior: cacheTime below the polling floor on sub-second chain.blockTime', () => {
  const client = createClient({
    chain: { ...localhost, blockTime: 300 },
    transport: http(),
  })

  expect(client.cacheTime).toMatchInlineSnapshot(`150`)
  expect(client.pollingInterval).toMatchInlineSnapshot(`500`)
})

test('behavior: cacheTime follows a pollingInterval shorter than half of chain.blockTime', () => {
  const client = createClient({
    chain: { ...localhost, blockTime: 300 },
    pollingInterval: 100,
    transport: http(),
  })

  expect(client.cacheTime).toMatchInlineSnapshot(`100`)
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
          "extend": [Function],
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
        "createAccessList": [Function],
        "createBlockFilter": [Function],
        "createContractEventFilter": [Function],
        "createEventFilter": [Function],
        "createPendingTransactionFilter": [Function],
        "dataSuffix": undefined,
        "estimateContractGas": [Function],
        "estimateFeesPerGas": [Function],
        "estimateGas": [Function],
        "estimateMaxPriorityFeePerGas": [Function],
        "extend": [Function],
        "fillTransaction": [Function],
        "getBalance": [Function],
        "getBlobBaseFee": [Function],
        "getBlock": [Function],
        "getBlockNumber": [Function],
        "getBlockReceipts": [Function],
        "getBlockTransactionCount": [Function],
        "getBytecode": [Function],
        "getChainId": [Function],
        "getCode": [Function],
        "getContractEvents": [Function],
        "getDelegation": [Function],
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
        "getRawTransaction": [Function],
        "getStorageAt": [Function],
        "getStorageValues": [Function],
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
        "scope": [Function],
        "sendRawTransaction": [Function],
        "sendRawTransactionSync": [Function],
        "simulate": [Function],
        "simulateBlocks": [Function],
        "simulateCalls": [Function],
        "simulateContract": [Function],
        "token": {
          "getAllowance": [Function],
          "getBalance": [Function],
          "getMetadata": [Function],
          "getTotalSupply": [Function],
        },
        "tokens": undefined,
        "transport": {
          "fetchOptions": undefined,
          "key": "http",
          "methods": undefined,
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
        "verifyHash": [Function],
        "verifyMessage": [Function],
        "verifySiweMessage": [Function],
        "verifyTypedData": [Function],
        "waitForTransactionReceipt": [Function],
        "watchBlockHeaders": [Function],
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

describe('scope', () => {
  test('default', () => {
    const client = createClient({
      transport: http('https://localhost'),
    }).extend((client) => ({
      getUid: () => client.uid,
    }))

    const scoped = client.scope()

    expect(scoped.uid).not.toBe(client.uid)
    expect(scoped.getUid()).toBe(scoped.uid)
    expect(client.getUid()).toBe(client.uid)
    const { uid: _, ...rest } = scoped
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "dataSuffix": undefined,
        "extend": [Function],
        "getUid": [Function],
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "scope": [Function],
        "tokens": undefined,
        "transport": {
          "fetchOptions": undefined,
          "key": "http",
          "methods": undefined,
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
          "url": "https://localhost",
        },
        "type": "base",
      }
    `)
  })

  test('behavior: memoizes scopes by signal', () => {
    const client = createClient({ transport: http('https://localhost') })
    const { signal } = new AbortController()

    expect(client.scope({ signal })).toBe(client.scope({ signal }))
    expect(client.scope({ signal })).not.toBe(
      client.scope({ signal: new AbortController().signal }),
    )
    expect(client.scope()).not.toBe(client.scope())
  })

  test('behavior: deduplicates across calls that share a signal', async () => {
    await using server = await createHeldServer()
    const client = createClient({
      transport: http(server.url),
    }).extend(publicActions)
    const { signal } = new AbortController()

    const first = client.scope({ signal }).getChainId()
    await server.held
    const second = client.scope({ signal }).getChainId()
    server.release()

    expect(await Promise.all([first, second])).toMatchInlineSnapshot(`
      [
        1,
        1,
      ]
    `)
  })

  test('behavior: does not join the parent cache', async () => {
    await using server = await createHeldServer()
    const client = createClient({
      transport: http(server.url),
    }).extend(publicActions)

    const pending = client.getBlockNumber()
    await server.held

    expect(await client.scope().getBlockNumber()).toMatchInlineSnapshot(`2n`)

    server.release()
    expect(await pending).toMatchInlineSnapshot(`1n`)
  })

  test('behavior: does not join deduplicated parent requests', async () => {
    await using server = await createHeldServer()
    const client = createClient({
      transport: http(server.url),
    }).extend(publicActions)

    const pending = client.getChainId()
    await server.held

    expect(await client.scope().getChainId()).toMatchInlineSnapshot(`2`)

    server.release()
    expect(await pending).toMatchInlineSnapshot(`1`)
  })

  test('behavior: batches within a scope, not across scopes', async () => {
    // Each response reports the size of the batch that carried it.
    const server = await createHttpServer(async (req, res) => {
      const body = JSON.parse(await readBody(req))
      res.end(
        JSON.stringify(
          body.map(({ id }: { id: number }) => ({
            id,
            jsonrpc: '2.0',
            result: `0x${body.length.toString(16)}`,
          })),
        ),
      )
    })
    const client = createClient({
      transport: http(server.url, { batch: true }),
    }).extend(publicActions)
    const scoped = client.scope()

    const results = await Promise.all([
      client.getBlockNumber(),
      scoped.getBlockNumber(),
      scoped.getChainId(),
    ])

    expect(results).toMatchInlineSnapshot(`
      [
        1n,
        2n,
        2,
      ]
    `)
    await server.close()
  })

  test('behavior: signal aborts scoped requests', async () => {
    await using server = await createHeldServer()
    const client = createClient({
      transport: http(server.url),
    }).extend(publicActions)
    const controller = new AbortController()

    const pending = client.scope({ signal: controller.signal }).getBlockNumber()
    await server.held
    controller.abort()

    await expect(pending).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AbortError: This operation was aborted]`,
    )
    expect(await client.getBlockNumber()).toMatchInlineSnapshot(`2n`)
  })

  test('behavior: signal aborts requests on transports that ignore it', async () => {
    const client = createClient({
      transport: custom({ request: () => new Promise(() => {}) }),
    })
    const controller = new AbortController()

    const pending = client
      .scope({ signal: controller.signal })
      .request({ method: 'eth_blockNumber' })
    controller.abort()

    await expect(pending).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AbortError: This operation was aborted]`,
    )
  })

  test('behavior: scopes of different Clients sharing a signal do not batch together', async () => {
    // Each response reports the size of the batch that carried it.
    const server = await createHttpServer(async (req, res) => {
      const body = JSON.parse(await readBody(req))
      res.end(
        JSON.stringify(
          body.map(({ id }: { id: number }) => ({
            id,
            jsonrpc: '2.0',
            result: `0x${body.length.toString(16)}`,
          })),
        ),
      )
    })
    const client = createClient({
      transport: http(server.url, { batch: true }),
    }).extend(publicActions)
    const { signal } = new AbortController()

    const results = await Promise.all([
      client.scope({ signal }).getChainId(),
      client
        .extend(() => ({}))
        .scope({ signal })
        .getChainId(),
    ])

    expect(results).toMatchInlineSnapshot(`
      [
        1,
        1,
      ]
    `)
    await server.close()
  })

  test('behavior: an extension named `scope` takes precedence', () => {
    const client = createClient({ transport: http('https://localhost') })
      .extend(() => ({ scope: 'custom' as const }))
      .extend(() => ({}))

    expect(client.scope).toMatchInlineSnapshot(`"custom"`)
  })

  test('behavior: nested scopes are isolated', async () => {
    await using server = await createHeldServer()
    const scoped = createClient({
      transport: http(server.url),
    })
      .extend(publicActions)
      .scope()

    const pending = scoped.getChainId()
    await server.held

    expect(await scoped.scope().getChainId()).toMatchInlineSnapshot(`2`)

    server.release()
    expect(await pending).toMatchInlineSnapshot(`1`)
  })
})

/** Starts a JSON-RPC server that holds its first request until released, answering `0x1` to it and `0x2` to the rest. */
async function createHeldServer() {
  const held = Promise.withResolvers<void>()
  const released = Promise.withResolvers<void>()
  let first = true
  const server = await createHttpServer(async (req, res) => {
    const { id } = JSON.parse(await readBody(req))
    const hold = first
    first = false
    if (hold) {
      held.resolve()
      await released.promise
    }
    res.end(
      JSON.stringify({ id, jsonrpc: '2.0', result: hold ? '0x1' : '0x2' }),
    )
  })
  return {
    held: held.promise,
    release: () => released.resolve(),
    url: server.url,
    async [Symbol.asyncDispose]() {
      released.resolve()
      await server.close()
    },
  }
}

async function readBody(req: AsyncIterable<Uint8Array>) {
  const chunks: Uint8Array[] = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks).toString()
}
