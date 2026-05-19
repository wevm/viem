import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, test, vi } from 'vp/test'
import { WebSocketServer } from 'ws'

import {
  Chain,
  Transport,
  custom,
  fallback,
  http,
  webSocket,
} from '../index.js'
import { HttpRequestError, TimeoutError } from './internal/request.js'

const chain = Chain.define({
  id: 1n,
  name: 'Test',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://example.com/rpc'],
      webSocket: ['wss://example.com/rpc'],
    },
  },
})

const cleanup: (() => Promise<void> | void)[] = []

afterEach(async () => {
  for (const dispose of cleanup.splice(0)) await dispose()
})

describe('create', () => {
  test('behavior: creates concrete transport instances', async () => {
    const request = vi.fn(async () => '0x1')
    const transport = Transport.create(
      {
        key: 'mock',
        name: 'Mock',
        request,
        type: 'mock',
      },
      { url: 'https://example.com' },
    )

    expect({
      config: transport.config,
      value: transport.value,
    }).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "methods": undefined,
          "name": "Mock",
          "request": [MockFunction],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "value": {
          "url": "https://example.com",
        },
      }
    `)
    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe('0x1')
  })

  test('behavior: applies method filters', async () => {
    const request = vi.fn(async () => '0x1')
    const transport = Transport.create({
      key: 'mock',
      methods: { include: ['eth_chainId'] },
      name: 'Mock',
      request,
      type: 'mock',
    })

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.MethodNotSupportedError: Method "eth_blockNumber" is not supported.]`,
    )
    expect(request).toHaveBeenCalledTimes(0)
  })
})

describe('shouldThrow', () => {
  test('behavior: identifies non-fallback errors', () => {
    expect({
      executionReverted: Transport.shouldThrow(
        Object.assign(new Error('execution reverted'), { code: 3 }),
      ),
      internal: Transport.shouldThrow(
        Object.assign(new Error('internal'), { code: -32603 }),
      ),
      plain: Transport.shouldThrow(new Error('plain')),
      caipRejected: Transport.shouldThrow(
        Object.assign(new Error('rejected'), { code: 5000 }),
      ),
      rejected: Transport.shouldThrow(
        Object.assign(new Error('rejected'), { code: 4001 }),
      ),
      transactionRejected: Transport.shouldThrow(
        Object.assign(new Error('rejected'), { code: -32003 }),
      ),
      walletConnect: Transport.shouldThrow(
        Object.assign(new Error('settlement failed'), { code: 7000 }),
      ),
    }).toMatchInlineSnapshot(`
      {
        "caipRejected": true,
        "executionReverted": true,
        "internal": false,
        "plain": false,
        "rejected": true,
        "transactionRejected": true,
        "walletConnect": true,
      }
    `)
  })
})

describe('custom', () => {
  test('behavior: creates provider transports', async () => {
    const provider = {
      request: vi.fn(async ({ method }) => `${method}:result`),
    }
    const transport = custom(provider, {
      key: 'provider',
      name: 'Provider',
      retryCount: 1,
    })({})

    await expect(transport.request({ method: 'eth_chainId' })).resolves.toBe(
      'eth_chainId:result',
    )
    expect(transport.config).toMatchInlineSnapshot(`
      {
        "key": "provider",
        "methods": undefined,
        "name": "Provider",
        "request": [Function],
        "retryCount": 1,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "custom",
      }
    `)
  })
})

describe('http', () => {
  test('behavior: creates transports with explicit URLs', () => {
    const transport = http('https://example.com/rpc', {
      fetchOptions: { headers: { authorization: 'Bearer token' } },
    })({})

    expect({
      config: transport.config,
      value: transport.value,
    }).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "http",
          "methods": undefined,
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
        },
        "value": {
          "fetchOptions": {
            "headers": {
              "authorization": "Bearer token",
            },
          },
          "url": "https://example.com/rpc",
        },
      }
    `)
  })

  test('behavior: resolves default chain URLs', () => {
    expect(http()({ chain }).value?.url).toBe('https://example.com/rpc')
  })

  test('behavior: requires URLs', () => {
    expect(() => http()({})).toThrow(Transport.UrlRequiredError)
  })

  test('behavior: sends successful requests', async () => {
    const server = await createHttpServer((body) => ({
      id: body.id,
      jsonrpc: '2.0',
      result: body.method,
    }))
    const transport = http(server.url)({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe('eth_blockNumber')
  })

  test('behavior: forwards abort signals to fetch', async () => {
    const server = await createHttpServer((body) => ({
      id: body.id,
      jsonrpc: '2.0',
      result: body.method,
    }))
    const transport = http(server.url)({})
    const controller = new AbortController()

    await expect(
      transport.request(
        { method: 'eth_blockNumber' },
        { signal: controller.signal },
      ),
    ).resolves.toBe('eth_blockNumber')
  })

  test('behavior: supports raw responses', async () => {
    const server = await createHttpServer((body) => ({
      error: { code: -32000, message: 'nope' },
      id: body.id,
      jsonrpc: '2.0',
    }))
    const transport = http(server.url, { raw: true })({})

    await expect(transport.request({ method: 'eth_blockNumber' })).resolves
      .toMatchInlineSnapshot(`
      {
        "error": {
          "code": -32000,
          "message": "nope",
        },
        "result": undefined,
      }
    `)
  })

  test('behavior: throws rpc errors', async () => {
    const server = await createHttpServer((body) => ({
      error: { code: -32000, message: 'nope' },
      id: body.id,
      jsonrpc: '2.0',
    }))
    const transport = http(server.url)({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toMatchObject({
      code: -32000,
      name: 'RpcResponse.InvalidInputError',
    })
  })

  test('behavior: batches requests', async () => {
    let count = 0
    const server = await createHttpServer((body) => {
      count++
      return body.map((request: { id: number; method: string }) => ({
        id: request.id,
        jsonrpc: '2.0',
        result: request.method,
      }))
    })
    const transport = http(server.url, { batch: true })({})

    const results = await Promise.all([
      transport.request({ method: 'eth_a' }),
      transport.request({ method: 'eth_b' }, { dedupe: true }),
      transport.request({ method: 'eth_b' }, { dedupe: true }),
    ])

    expect({ count, results }).toMatchInlineSnapshot(`
      {
        "count": 1,
        "results": [
          "eth_a",
          "eth_b",
          "eth_b",
        ],
      }
    `)
  })

  test('behavior: reuses signal-scoped batch IDs', async () => {
    const server = await createHttpServer((body) =>
      body.map((request: { id: number; method: string }) => ({
        id: request.id,
        jsonrpc: '2.0',
        result: request.method,
      })),
    )
    const transport = http(server.url, { batch: true })({})
    const controller = new AbortController()

    await expect(
      Promise.all([
        transport.request({ method: 'eth_a' }, { signal: controller.signal }),
        transport.request({ method: 'eth_b' }, { signal: controller.signal }),
      ]),
    ).resolves.toEqual(['eth_a', 'eth_b'])
  })

  test('behavior: splits batches by size', async () => {
    let count = 0
    const server = await createHttpServer((body) => {
      count++
      return body.map((request: { id: number; method: string }) => ({
        id: request.id,
        jsonrpc: '2.0',
        result: request.method,
      }))
    })
    const transport = http(server.url, {
      batch: { batchSize: 1 },
    })({})

    await Promise.all([
      transport.request({ method: 'eth_a' }),
      transport.request({ method: 'eth_b' }),
    ])

    expect(count).toBe(2)
  })

  test('behavior: supports fetch hooks and basic auth URLs', async () => {
    const requestHook = vi.fn()
    const responseHook = vi.fn()
    const server = await createHttpServer((body, request) => ({
      id: body.id,
      jsonrpc: '2.0',
      result: request.headers.authorization,
    }))
    const url = server.url.replace('http://', 'http://user:pass@')
    const transport = http(url, {
      onFetchRequest(request, init) {
        requestHook(request.url)
        return init
      },
      onFetchResponse(response) {
        responseHook(response.status)
      },
    })({})

    await expect(transport.request({ method: 'eth_chainId' })).resolves.toBe(
      'Basic dXNlcjpwYXNz',
    )
    expect({
      requestHook: requestHook.mock.calls,
      responseHook: responseHook.mock.calls,
    }).toMatchInlineSnapshot(`
      {
        "requestHook": [
          [
            "${server.url}/",
          ],
        ],
        "responseHook": [
          [
            200,
          ],
        ],
      }
    `)
  })

  test('behavior: wraps failed http responses', async () => {
    const server = await createHttpServer(() => 'nope', {
      status: 500,
      type: 'text/plain',
    })
    const transport = http(server.url)({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }, { retryCount: 0 }),
    ).rejects.toThrow(HttpRequestError)
  })

  test('behavior: preserves json-rpc errors from failed http responses', async () => {
    const server = await createHttpServer(
      (body) => ({
        error: { code: -32000, message: 'nope' },
        id: body.id,
        jsonrpc: '2.0',
      }),
      { status: 500 },
    )
    const transport = http(server.url)({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }, { retryCount: 0 }),
    ).rejects.toMatchObject({
      code: -32000,
    })
  })

  test('behavior: wraps invalid successful text responses', async () => {
    const server = await createHttpServer(() => 'not-json', {
      type: 'text/plain',
    })
    const transport = http(server.url)({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }, { retryCount: 0 }),
    ).rejects.toThrow(HttpRequestError)
  })

  test('behavior: parses empty successful text responses', async () => {
    const server = await createHttpServer(() => '', {
      type: 'text/plain',
    })
    const transport = http(server.url)({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }, { retryCount: 0 }),
    ).resolves.toBeUndefined()
  })

  test('behavior: forwards request abort reasons', async () => {
    const controller = new AbortController()
    const server = await createHttpServer((body) => ({
      id: body.id,
      jsonrpc: '2.0',
      result: body.method,
    }))
    const transport = http(server.url, {
      fetchFn: async () => {
        controller.abort(new Error('aborted by test'))
        throw new Error('ignored')
      },
    })({})

    await expect(
      transport.request(
        { method: 'eth_chainId' },
        { retryCount: 0, signal: controller.signal },
      ),
    ).rejects.toThrow('aborted by test')
  })

  test('behavior: forwards fetch abort errors', async () => {
    const server = await createHttpServer((body) => ({
      id: body.id,
      jsonrpc: '2.0',
      result: body.method,
    }))
    const transport = http(server.url, {
      fetchFn: async () => {
        throw new DOMException('aborted', 'AbortError')
      },
    })({})

    await expect(
      transport.request({ method: 'eth_chainId' }, { retryCount: 0 }),
    ).rejects.toThrow('aborted')
  })

  test('behavior: throws timeout errors', async () => {
    const server = await createHttpServer((body) => ({
      id: body.id,
      jsonrpc: '2.0',
      result: body.method,
    }))
    const transport = http(server.url, {
      fetchFn: async () => {
        throw new TimeoutError({
          body: { method: 'eth_chainId' },
          url: server.url,
        })
      },
    })({})

    await expect(
      transport.request({ method: 'eth_chainId' }, { retryCount: 0 }),
    ).rejects.toThrow('timed out')
  })
})

describe('fallback', () => {
  test('behavior: falls through to the next transport', async () => {
    const onResponse = vi.fn()
    const first = custom({
      async request() {
        throw Object.assign(new Error('down'), { code: -32603 })
      },
    })
    const second = custom({
      async request() {
        return '0x1'
      },
    })
    const transport = fallback([first, second])({})
    transport.value?.onResponse(onResponse)

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe('0x1')
    expect(onResponse.mock.calls.map(([value]) => value.status))
      .toMatchInlineSnapshot(`
        [
          "error",
          "success",
        ]
      `)
  })

  test('behavior: stops on non-fallback errors', async () => {
    const first = custom({
      async request() {
        throw Object.assign(new Error('rejected'), { code: 4001 })
      },
    })
    const second = custom({
      async request() {
        return '0x1'
      },
    })
    const transport = fallback([first, second])({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('rejected')
  })

  test('behavior: skips transports that cannot serve the method', async () => {
    const first = custom({
      async request() {
        throw Object.assign(new Error('down'), { code: -32603 })
      },
    })
    const second = custom(
      {
        async request() {
          return '0x1'
        },
      },
      { methods: { include: ['eth_chainId'] } },
    )
    const transport = fallback([first, second])({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('down')
  })

  test('behavior: skips transports that exclude the method', async () => {
    const first = custom({
      async request() {
        throw Object.assign(new Error('down'), { code: -32603 })
      },
    })
    const second = custom(
      {
        async request() {
          return '0x1'
        },
      },
      { methods: { exclude: ['eth_blockNumber'] } },
    )
    const transport = fallback([first, second])({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('down')
  })

  test('behavior: returns undefined for empty fallback transports', async () => {
    const transport = fallback([])({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBeUndefined()
  })

  test('behavior: throws the last fallback error', async () => {
    const transport = fallback([
      custom({
        async request() {
          throw Object.assign(new Error('down'), { code: -32603 })
        },
      }),
    ])({})

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('down')
  })

  test('behavior: ranks fallback transports', async () => {
    vi.useFakeTimers()
    const first = custom(
      {
        async request() {
          return 'first'
        },
      },
      { key: 'first' },
    )
    const second = custom(
      {
        async request() {
          return 'second'
        },
      },
      { key: 'second' },
    )
    const pings: string[] = []
    const transport = fallback([first, second], {
      rank: {
        interval: 1_000,
        async ping({ transport }) {
          pings.push(transport.config.key)
          if (transport.config.key === 'first') throw new Error('down')
        },
      },
    })({})

    await vi.waitFor(() => expect(pings).toEqual(['first', 'second']))
    await vi.waitFor(async () =>
      expect(await transport.request({ method: 'eth_blockNumber' })).toBe(
        'second',
      ),
    )
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  test('behavior: enables default fallback ranking', async () => {
    vi.useFakeTimers()
    const request = vi.fn(async () => true)
    const transport = fallback([custom({ request })], { rank: true })({})

    await vi.waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        { method: 'net_listening' },
        undefined,
      ),
    )
    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe(true)
    vi.clearAllTimers()
    vi.useRealTimers()
  })
})

describe('webSocket', () => {
  test('behavior: resolves default chain URLs', () => {
    expect(() => webSocket()({ chain })).not.toThrow()
  })

  test('behavior: requires URLs', () => {
    expect(() => webSocket()({})).toThrow(Transport.UrlRequiredError)
  })

  test('behavior: sends requests', async () => {
    const server = await createWebSocketServer(
      (body) => ({
        id: body.id,
        jsonrpc: '2.0',
        result: body.method,
      }),
      {
        onMessage(socket) {
          socket.send('')
        },
      },
    )
    const transport = webSocket(server.url, { keepAlive: false })({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).resolves.toBe('eth_blockNumber')
    ;(await transport.value?.getRpcClient())?.close()
  })

  test('behavior: throws websocket rpc errors', async () => {
    const server = await createWebSocketServer((body) => ({
      error: { code: -32000, message: 'nope' },
      id: body.id,
      jsonrpc: '2.0',
    }))
    const transport = webSocket(server.url, { keepAlive: false })({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toMatchObject({
      code: -32000,
    })
    ;(await transport.value?.getRpcClient())?.close()
  })

  test('behavior: subscribes and unsubscribes', async () => {
    const server = await createWebSocketServer((body, socket) => {
      if (body.method === 'eth_subscribe') {
        setTimeout(() => {
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: {},
            }),
          )
          socket.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: {
                result: '0x2',
                subscription: '0x1',
              },
            }),
          )
        }, 20)
        return {
          id: body.id,
          jsonrpc: '2.0',
          result: '0x1',
        }
      }
      return {
        id: body.id,
        jsonrpc: '2.0',
        result: true,
      }
    })
    const transport = webSocket(server.url, { keepAlive: false })({})
    const client = await transport.value!.getRpcClient()
    const onData = vi.fn()
    const subscription = await transport.value!.subscribe({
      onData,
      params: ['newHeads'],
    })
    await vi.waitFor(() => expect(onData).toHaveBeenCalledTimes(1))

    await expect(subscription.unsubscribe()).resolves.toMatchObject({
      result: true,
    })
    expect({
      data: onData.mock.calls,
      subscriptionId: subscription.subscriptionId,
    }).toMatchInlineSnapshot(`
      {
        "data": [
          [
            {
              "result": "0x2",
              "subscription": "0x1",
            },
          ],
        ],
        "subscriptionId": "0x1",
      }
    `)
    client.close()
  })

  test('behavior: rejects pending requests when sockets close', async () => {
    const server = await createWebSocketServer((_body, socket) => {
      socket.close()
    })
    const transport = webSocket(server.url, { keepAlive: false })({})

    await expect(
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow('closed')
  })

  test('behavior: rejects pending subscriptions when sockets close', async () => {
    const server = await createWebSocketServer((_body, socket) => {
      socket.close()
    })
    const transport = webSocket(server.url, { keepAlive: false })({})
    const onError = vi.fn()

    await expect(() =>
      transport.value!.subscribe({
        onData() {},
        onError,
        params: ['newHeads'],
      }),
    ).rejects.toThrow('closed')
    expect(onError).toHaveBeenCalledTimes(1)
  })

  test('behavior: rejects websocket subscription errors', async () => {
    const server = await createWebSocketServer((body) => ({
      error: { code: -32000, message: 'nope' },
      id: body.id,
      jsonrpc: '2.0',
    }))
    const transport = webSocket(server.url, { keepAlive: false })({})
    const client = await transport.value!.getRpcClient()
    const onError = vi.fn()

    await expect(() =>
      transport.value!.subscribe({
        onData() {},
        onError,
        params: ['newHeads'],
      }),
    ).rejects.toMatchObject({
      code: -32000,
    })
    expect(onError).toHaveBeenCalledTimes(1)
    client.close()
  })

  test('behavior: rejects requests on closed sockets', async () => {
    const server = await createWebSocketServer((body) => ({
      id: body.id,
      jsonrpc: '2.0',
      result: body.method,
    }))
    const transport = webSocket(server.url, {
      keepAlive: { interval: 1 },
    })({})
    const client = await transport.value!.getRpcClient()
    await new Promise((resolve) => setTimeout(resolve, 5))
    client.close()

    expect(() =>
      client.request({
        body: { method: 'eth_blockNumber' },
        onResponse() {},
      }),
    ).toThrow('WebSocket request failed.')
  })
})

async function createHttpServer(
  handler: (
    body: any,
    request: Parameters<Parameters<typeof createServer>[0]>[0],
  ) => unknown,
  options: { status?: number; type?: string } = {},
) {
  const server = createServer((request, response) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      const parsed = JSON.parse(body)
      const result = handler(parsed, request)
      response.statusCode = options.status ?? 200
      response.setHeader('Content-Type', options.type ?? 'application/json')
      response.end(
        options.type === 'text/plain' ? String(result) : JSON.stringify(result),
      )
    })
  })
  await new Promise<void>((resolve) => server.listen(0, resolve))
  cleanup.push(
    () => new Promise<void>((resolve) => server.close(() => resolve())),
  )
  const address = server.address() as AddressInfo
  return { url: `http://127.0.0.1:${address.port}` }
}

async function createWebSocketServer(
  handler: (body: any, socket: import('ws').WebSocket) => unknown,
  options: {
    onMessage?: ((socket: import('ws').WebSocket) => void) | undefined
  } = {},
) {
  const server = new WebSocketServer({ port: 0 })
  server.on('connection', (socket) => {
    socket.on('message', (message) => {
      options.onMessage?.(socket)
      const result = handler(JSON.parse(String(message)), socket)
      if (result) socket.send(JSON.stringify(result))
    })
  })
  await new Promise<void>((resolve) => server.once('listening', resolve))
  cleanup.push(
    () => new Promise<void>((resolve) => server.close(() => resolve())),
  )
  const address = server.address() as AddressInfo
  return { url: `ws://127.0.0.1:${address.port}` }
}
