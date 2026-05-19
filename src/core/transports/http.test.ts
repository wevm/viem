import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, test, vi } from 'vp/test'

import * as Chain from '../Chain.js'
import * as Transport from '../Transport.js'
import { HttpRequestError, TimeoutError } from '../internal/request.js'
import { http } from './http.js'

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
    },
  },
})

const cleanup: (() => Promise<void> | void)[] = []

afterEach(async () => {
  for (const dispose of cleanup.splice(0)) await dispose()
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
