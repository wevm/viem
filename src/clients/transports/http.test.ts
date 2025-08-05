import type { IncomingHttpHeaders } from 'node:http'
import { assertType, describe, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { createHttpServer } from '~test/utils.js'
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

test('no url', () => {
  expect(() => http()({})).toThrowErrorMatchingInlineSnapshot(
    `
    [UrlRequiredError: No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.

    Docs: https://viem.sh/docs/clients/intro
    Version: viem@x.y.z]
  `,
  )
})

describe('request cancellation', () => {
  test('cancels request with AbortSignal', async () => {
    const server = await createHttpServer((_, res) => {
      // Delay response to allow time for cancellation
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ jsonrpc: '2.0', result: '0x1', id: 0 }))
      }, 100)
    })

    const controller = new AbortController()
    const transport = http(server.url)({})

    // Cancel after 50ms (before server responds at 100ms)
    setTimeout(() => controller.abort(), 50)

    await expect(
      transport.request(
        { method: 'eth_blockNumber' },
        { signal: controller.signal },
      ),
    ).rejects.toThrow()

    await server.close()
  })

  test('successful request with signal', async () => {
    const server = await createHttpServer((_, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', result: '0x1', id: 0 }))
    })

    const controller = new AbortController()
    const transport = http(server.url)({})

    const result = await transport.request(
      { method: 'eth_blockNumber' },
      { signal: controller.signal },
    )

    expect(result).toBe('0x1')
    await server.close()
  })

  test('multiple requests with same controller', async () => {
    const server = await createHttpServer((_, res) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ jsonrpc: '2.0', result: '0x1', id: 0 }))
      }, 100)
    })

    const controller = new AbortController()
    const transport = http(server.url)({})

    // Start multiple requests
    const promise1 = transport.request(
      { method: 'eth_blockNumber' },
      { signal: controller.signal },
    )
    const promise2 = transport.request(
      {
        method: 'eth_getBalance',
        params: ['0x0000000000000000000000000000000000000000'],
      },
      { signal: controller.signal },
    )

    // Cancel after 50ms
    setTimeout(() => controller.abort(), 50)

    await expect(promise1).rejects.toThrow()
    await expect(promise2).rejects.toThrow()

    await server.close()
  })
})
