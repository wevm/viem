import type { IncomingHttpHeaders } from 'node:http'
import { assertType, describe, expect, test } from 'vitest'
import { createHttpServer } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { localhost } from '../../chains/index.js'
import { wait } from '../../utils/wait.js'
import { type HttpTransport, http } from './http.js'

test('default', () => {
  const transport = http('https://mockapi.com/rpc')

  assertType<HttpTransport>(transport)
  assertType<'http'>(transport({}).config.type)

  expect(transport({})).toMatchInlineSnapshot(`
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
      "request": [Function],
      "value": {
        "fetchOptions": undefined,
        "url": "https://mockapi.com/rpc",
      },
    }
  `)
})

describe('config', () => {
  test('key', () => {
    const transport = http('https://mockapi.com/rpc', {
      key: 'mock',
    })({})

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "mock",
          "methods": undefined,
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
        },
        "request": [Function],
        "value": {
          "fetchOptions": undefined,
          "url": "https://mockapi.com/rpc",
        },
      }
    `)
  })

  test('name', () => {
    const transport = http('https://mockapi.com/rpc', {
      name: 'Mock Transport',
    })({})

    expect(transport).toMatchInlineSnapshot(`
      {
        "config": {
          "key": "http",
          "methods": undefined,
          "name": "Mock Transport",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
        },
        "request": [Function],
        "value": {
          "fetchOptions": undefined,
          "url": "https://mockapi.com/rpc",
        },
      }
    `)
  })

  test('url', () => {
    const transport = http('https://mockapi.com/rpc')({})

    expect(transport).toMatchInlineSnapshot(`
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
        "request": [Function],
        "value": {
          "fetchOptions": undefined,
          "url": "https://mockapi.com/rpc",
        },
      }
    `)
  })

  test('fetchOptions', () => {
    const transport = http('https://mockapi.com/rpc', {
      fetchOptions: { headers: { Authorization: 'wagmi' } },
    })({})

    expect(transport).toMatchInlineSnapshot(`
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
        "request": [Function],
        "value": {
          "fetchOptions": {
            "headers": {
              "Authorization": "wagmi",
            },
          },
          "url": "https://mockapi.com/rpc",
        },
      }
    `)
  })

  test('raw', () => {
    const transport = http('https://mockapi.com/rpc', {
      raw: true,
    })({})

    expect(transport).toMatchInlineSnapshot(`
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
        "request": [Function],
        "value": {
          "fetchOptions": undefined,
          "url": "https://mockapi.com/rpc",
        },
      }
    `)
  })
})

describe('request', () => {
  test('default', async () => {
    const transport = http(undefined, {
      key: 'jsonRpc',
      name: 'JSON RPC',
    })({
      chain: {
        ...localhost,
        rpcUrls: {
          default: {
            http: [anvilMainnet.rpcUrl.http],
          },
        },
      },
    })

    expect(await transport.request({ method: 'eth_blockNumber' })).toBeDefined()
  })

  test('batch', async () => {
    let count = 0
    const server = await createHttpServer((_, res) => {
      count++
      res.appendHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify([
          { result: '0x1' },
          { result: '0x2' },
          { result: '0x3' },
        ]),
      )
    })

    const transport = http(server.url, {
      key: 'mock',
      batch: true,
    })({ chain: localhost })

    const p = []
    p.push(transport.request({ method: 'eth_a' }))
    p.push(transport.request({ method: 'eth_b' }, { dedupe: true }))
    p.push(transport.request({ method: 'eth_c' }))
    // test dedupe
    p.push(transport.request({ method: 'eth_b' }, { dedupe: true }))
    await wait(1)
    p.push(transport.request({ method: 'eth_d' }, { dedupe: true }))
    p.push(transport.request({ method: 'eth_e' }))
    // test dedupe
    p.push(transport.request({ method: 'eth_d' }, { dedupe: true }))

    const results = await Promise.all(p)

    expect(results).toMatchInlineSnapshot(`
      [
        "0x1",
        "0x2",
        "0x3",
        "0x2",
        "0x1",
        "0x2",
        "0x1",
      ]
    `)
    expect(count).toEqual(2)

    await server.close()
  })

  test('batch (with wait)', async () => {
    let count = 0
    const server = await createHttpServer((_, res) => {
      count++
      res.appendHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify([
          { result: '0x1' },
          { result: '0x2' },
          { result: '0x3' },
          { result: '0x4' },
          { result: '0x5' },
        ]),
      )
    })

    const transport = http(server.url, {
      key: 'mock',
      batch: { wait: 16 },
    })({ chain: localhost })

    const p = []
    p.push(transport.request({ method: 'eth_a' }))
    p.push(transport.request({ method: 'eth_b' }, { dedupe: true }))
    p.push(transport.request({ method: 'eth_c' }))
    // test dedupe
    p.push(transport.request({ method: 'eth_b' }, { dedupe: true }))
    await wait(1)
    p.push(transport.request({ method: 'eth_d' }))
    p.push(transport.request({ method: 'eth_e' }))
    await wait(20)
    p.push(transport.request({ method: 'eth_f' }, { dedupe: true }))
    p.push(transport.request({ method: 'eth_g' }))
    // test dedupe
    p.push(transport.request({ method: 'eth_f' }, { dedupe: true }))

    const results = await Promise.all(p)

    expect(results).toMatchInlineSnapshot(`
      [
        "0x1",
        "0x2",
        "0x3",
        "0x2",
        "0x4",
        "0x5",
        "0x1",
        "0x2",
        "0x1",
      ]
    `)
    expect(count).toEqual(2)

    await server.close()
  })

  test('behavior: dedupe', async () => {
    const args: string[] = []
    const server = await createHttpServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        args.push(body)
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ result: body }))
      })
    })

    const transport = http(server.url, {
      key: 'mock',
    })({ chain: localhost })

    const results = await Promise.all([
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (different params).
      transport.request(
        { method: 'eth_blockNumber', params: [1] },
        { dedupe: true },
      ),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (different method).
      transport.request({ method: 'eth_chainId' }, { dedupe: true }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (dedupe: undefined).
      transport.request({ method: 'eth_blockNumber' }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
    ])

    expect(
      args
        .map((arg) => JSON.parse(arg))
        .sort((a, b) => a.id - b.id)
        .map((arg) => JSON.stringify(arg)),
    ).toMatchInlineSnapshot(`
      [
        "{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber"}",
        "{"jsonrpc":"2.0","id":2,"method":"eth_blockNumber","params":[1]}",
        "{"jsonrpc":"2.0","id":3,"method":"eth_chainId"}",
        "{"jsonrpc":"2.0","id":4,"method":"eth_blockNumber"}",
      ]
    `)
    expect(results).toMatchInlineSnapshot(`
      [
        "{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber"}",
        "{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber"}",
        "{"jsonrpc":"2.0","id":2,"method":"eth_blockNumber","params":[1]}",
        "{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber"}",
        "{"jsonrpc":"2.0","id":3,"method":"eth_chainId"}",
        "{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber"}",
        "{"jsonrpc":"2.0","id":4,"method":"eth_blockNumber"}",
        "{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber"}",
      ]
    `)
  })

  test('behavior: fetchOptions', async () => {
    let headers: IncomingHttpHeaders = {}
    const server = await createHttpServer((req, res) => {
      headers = req.headers
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = http(server.url, {
      key: 'mock',
      fetchOptions: {
        headers: { 'x-wagmi': 'gm' },
        cache: 'force-cache',
        method: 'PATCH',
        signal: null,
      },
    })({ chain: localhost })

    await transport.request({ method: 'eth_blockNumber' })
    expect(headers['x-wagmi']).toBeDefined()

    await server.close()
  })

  test('behavior: onFetchRequest', async () => {
    const server = await createHttpServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const requests: Request[] = []
    const transport = http(server.url, {
      key: 'mock',
      onFetchRequest(request) {
        requests.push(request)
      },
    })({ chain: localhost })

    await transport.request({ method: 'eth_blockNumber' })

    expect(requests.length).toBe(1)

    await server.close()
  })

  test('behavior: onFetchResponse', async () => {
    const server = await createHttpServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const responses: Response[] = []
    const transport = http(server.url, {
      key: 'mock',
      onFetchResponse(response) {
        responses.push(response)
      },
    })({ chain: localhost })

    await transport.request({ method: 'eth_blockNumber' })

    expect(responses.length).toBe(1)

    await server.close()
  })

  test('behavior: methods.exclude', async () => {
    const server = await createHttpServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = http(server.url, {
      key: 'jsonRpc',
      name: 'JSON RPC',
      methods: { exclude: ['eth_a'] },
    })({ chain: localhost })

    await transport.request({ method: 'eth_b' })

    await expect(() =>
      transport.request({ method: 'eth_a' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [MethodNotSupportedRpcError: Method "eth_a" is not supported.

      Details: method not supported
      Version: viem@x.y.z]
    `)
  })

  test('behavior: methods.include', async () => {
    const server = await createHttpServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = http(server.url, {
      key: 'jsonRpc',
      name: 'JSON RPC',
      methods: { include: ['eth_a', 'eth_b'] },
    })({ chain: localhost })

    await transport.request({ method: 'eth_a' })
    await transport.request({ method: 'eth_b' })

    await expect(() =>
      transport.request({ method: 'eth_c' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [MethodNotSupportedRpcError: Method "eth_c" is not supported.

      Details: method not supported
      Version: viem@x.y.z]
    `)
  })

  test('behavior: retryCount', async () => {
    let retryCount = -1
    const server = await createHttpServer((_req, res) => {
      retryCount++
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({}))
    })

    const transport = http(server.url, {
      key: 'jsonRpc',
      name: 'JSON RPC',
      retryCount: 1,
    })({ chain: localhost })

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: {"method":"eth_blockNumber"}

      Details: Internal Server Error
      Version: viem@x.y.z]
    `)
    expect(retryCount).toBe(1)
  })

  test('behavior: retryCount', async () => {
    const start = Date.now()
    let end = 0
    const server = await createHttpServer((_req, res) => {
      end = Date.now() - start
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({}))
    })

    const transport = http(server.url, {
      key: 'jsonRpc',
      name: 'JSON RPC',
      retryCount: 1,
      retryDelay: 500,
    })({ chain: localhost })

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: {"method":"eth_blockNumber"}

      Details: Internal Server Error
      Version: viem@x.y.z]
    `)
    expect(end > 500 && end < 520).toBeTruthy()
  })

  test('behavior: timeout', async () => {
    const server = await createHttpServer(async (_req, res) => {
      await wait(5000)
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({}))
    })

    const transport = http(server.url, {
      key: 'jsonRpc',
      name: 'JSON RPC',
      timeout: 100,
    })({ chain: localhost })

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TimeoutError: The request took too long to respond.

      URL: http://localhost
      Request body: {"method":"eth_blockNumber"}

      Details: The request timed out.
      Version: viem@x.y.z]
    `)
  })

  test('behavior: raw', async () => {
    const transport = http(anvilMainnet.rpcUrl.http, {
      key: 'jsonRpc',
      name: 'JSON RPC',
      raw: true,
    })({
      chain: localhost,
    })

    const response = await transport.request({ method: '' })
    expect(response).toMatchInlineSnapshot(`
      {
        "error": {
          "code": -32601,
          "message": "Method not found",
        },
        "result": undefined,
      }
    `)
  })

  test('errors: rpc error', async () => {
    const transport = http(anvilMainnet.rpcUrl.http, {
      key: 'jsonRpc',
      name: 'JSON RPC',
    })({
      chain: localhost,
    })

    await expect(() =>
      transport.request({ method: 'eth_wagmi' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [MethodNotFoundRpcError: The method "eth_wagmi" does not exist / is not available.

      URL: http://localhost
      Request body: {"method":"eth_wagmi"}

      Details: Method not found
      Version: viem@x.y.z]
    `)
  })
})

describe('tor support', () => {
  test('tor config with string array filter', async () => {
    const mockTorFetch = new MockFetch('0xtor')
    const mockRegularFetch = new MockFetch('0xregular')

    const transport = http('https://mockapi.com/rpc', {
      fetchFn: mockRegularFetch.fetch,
      tor: {
        snowflakeUrl: 'https://snowflake.example.com/',
        filter: ['eth_getBalance', 'eth_sendTransaction'], // Only these methods use Tor
        sharedClient: mockTorFetch as any,
      },
    })({ chain: localhost })

    // Reset counters
    mockTorFetch.reset()
    mockRegularFetch.reset()

    // Request that should NOT use Tor
    const blockNumber = await transport.request({ method: 'eth_blockNumber' })
    expect(blockNumber).toBe('0xregular')
    expect(mockRegularFetch.wasCalled()).toBe(true)
    expect(mockTorFetch.callCount).toBe(0)

    // Request that SHOULD use Tor
    const balance = await transport.request({
      method: 'eth_getBalance',
      params: ['0x123'],
    })
    expect(balance).toBe('0xtor')
    expect(mockRegularFetch.callCount).toBe(1) // unchanged from previous call
    expect(mockTorFetch.callCount).toBe(1)
    expect(mockTorFetch.wasMethodUsed('eth_getBalance')).toBe(true)
    expect(mockTorFetch.wasLastRequestBatch()).toBe(false)
  })

  test('tor config with function filter', async () => {
    const mockTorFetch = new MockFetch('0xtor')
    const mockRegularFetch = new MockFetch('0xregular')

    const transport = http('https://mockapi.com/rpc', {
      fetchFn: mockRegularFetch.fetch,
      tor: {
        snowflakeUrl: 'https://snowflake.example.com/',
        filter: (body) => body.some((req) => req.method.includes('Balance')), // Function-based filter
        sharedClient: mockTorFetch as any,
      },
    })({ chain: localhost })

    // Reset counters
    mockTorFetch.reset()
    mockRegularFetch.reset()

    // Request that should NOT use Tor
    await transport.request({ method: 'eth_blockNumber' })
    expect(mockRegularFetch.callCount).toBe(1)
    expect(mockTorFetch.callCount).toBe(0)

    // Request that SHOULD use Tor (contains 'Balance')
    await transport.request({ method: 'eth_getBalance', params: ['0x123'] })
    expect(mockRegularFetch.callCount).toBe(1) // unchanged
    expect(mockTorFetch.callCount).toBe(1)
  })

  test('tor config with batch requests', async () => {
    const mockTorFetch = new MockFetch('0xtor')
    const mockRegularFetch = new MockFetch('0xregular')

    const transport = http('https://mockapi.com/rpc', {
      batch: true,
      fetchFn: mockRegularFetch.fetch,
      tor: {
        snowflakeUrl: 'https://snowflake.example.com/',
        filter: ['eth_getBalance'], // Only balance calls use Tor
        sharedClient: mockTorFetch as any,
      },
    })({ chain: localhost })

    // Reset counters
    mockTorFetch.reset()
    mockRegularFetch.reset()

    // Batch with mixed requests - one should trigger Tor for the entire batch
    const promises = [
      transport.request({ method: 'eth_blockNumber' }),
      transport.request({ method: 'eth_getBalance', params: ['0x123'] }), // This triggers Tor
    ]

    const results = await Promise.all(promises)

    // Since one request in the batch uses Tor, the entire batch should go through Tor
    expect(mockTorFetch.callCount).toBe(1)
    expect(mockRegularFetch.callCount).toBe(0)
    expect(results).toEqual(['0xtor1', '0xtor2'])

    // Verify the batch contained both methods using helper methods
    expect(mockTorFetch.wasLastRequestBatch()).toBe(true)
    expect(mockTorFetch.getLastRequestBody()).toHaveLength(2)
    expect(mockTorFetch.wasMethodUsed('eth_blockNumber')).toBe(true)
    expect(mockTorFetch.wasMethodUsed('eth_getBalance')).toBe(true)
  })

  test('tor error handling', async () => {
    const mockTorFetch = new MockFetch('0xtor')
    mockTorFetch.setErrorResponse({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32601, message: 'Method not found via Tor' },
    })

    const transport = http('https://mockapi.com/rpc', {
      tor: {
        snowflakeUrl: 'https://snowflake.example.com/',
        filter: ['eth_getBalance'],
        sharedClient: mockTorFetch as any,
      },
    })({ chain: localhost })

    await expect(() =>
      transport.request({ method: 'eth_getBalance', params: ['0x123'] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [MethodNotFoundRpcError: The method "eth_getBalance" does not exist / is not available.

      URL: http://localhost
      Request body: {"method":"eth_getBalance","params":["0x123"]}

      Details: Method not found via Tor
      Version: viem@x.y.z]
    `)
  })

  class MockFetch {
    public callCount = 0
    public usedMethods: string[] = []
    public requestBodies: any[] = []
    private responseOverride: Response | undefined
    private errorResponse: any

    constructor(private defaultResult = '0xmock') {}

    setResponse(response: Response) {
      this.responseOverride = response
      return this
    }

    setErrorResponse(error: any) {
      this.errorResponse = error
      return this
    }

    reset() {
      this.callCount = 0
      this.usedMethods = []
      this.requestBodies = []
      this.responseOverride = undefined
      this.errorResponse = undefined
      return this
    }

    // Helper methods for testing
    wasCalled(): boolean {
      return this.callCount > 0
    }

    wasMethodUsed(method: string): boolean {
      return this.usedMethods.includes(method)
    }

    getLastRequestBody() {
      return this.requestBodies[this.requestBodies.length - 1]
    }

    wasLastRequestBatch(): boolean {
      const lastBody = this.getLastRequestBody()
      return Array.isArray(lastBody)
    }

    // Works as both fetch function and TorClient.fetch method
    fetch = async (_input: RequestInfo | URL | string, init?: RequestInit) => {
      this.callCount++

      // Track request details
      if (init?.body && typeof init.body === 'string') {
        try {
          const body = JSON.parse(init.body)
          this.requestBodies.push(body)

          if (Array.isArray(body)) {
            this.usedMethods.push(...body.map((req: any) => req.method))
          } else {
            this.usedMethods.push(body.method)
          }
        } catch {
          // ignore parse errors
        }
      }

      // Return custom response if set
      if (this.responseOverride) {
        return this.responseOverride
      }

      // Return error response if set
      if (this.errorResponse) {
        return new Response(JSON.stringify(this.errorResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Determine if this is a batch request
      const isBatch =
        this.requestBodies[this.requestBodies.length - 1] &&
        Array.isArray(this.requestBodies[this.requestBodies.length - 1])

      if (isBatch) {
        const batchSize =
          this.requestBodies[this.requestBodies.length - 1].length
        const results = Array.from({ length: batchSize }, (_, i) => ({
          result: `${this.defaultResult}${i + 1}`,
        }))
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ result: this.defaultResult }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
})

test('no url', () => {
  expect(() => http()({})).toThrowErrorMatchingInlineSnapshot(
    `
    [UrlRequiredError: No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.

    Docs: https://viem.sh/docs/clients/intro
    Version: viem@x.y.z]
  `,
  )
})
