import type { IncomingHttpHeaders } from 'http'
import { assertType, describe, expect, test } from 'vitest'

import { localhost } from '../../chains.js'
import { wait } from '../../utils/wait.js'
import { createHttpServer } from '../../_test/index.js'

import type { HttpTransport } from './http.js'
import { http } from './http.js'

test('default', () => {
  const transport = http('https://mockapi.com/rpc')

  assertType<HttpTransport>(transport)
  assertType<'http'>(transport({}).config.type)

  expect(transport({})).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "http",
        "name": "HTTP JSON-RPC",
        "request": [Function],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": 10000,
        "type": "http",
      },
      "request": [Function],
      "value": {
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
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
        },
        "request": [Function],
        "value": {
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
          "name": "Mock Transport",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
        },
        "request": [Function],
        "value": {
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
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
        },
        "request": [Function],
        "value": {
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
    })({ chain: localhost })

    expect(await transport.request({ method: 'eth_blockNumber' })).toBeDefined()
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
        "HTTP request failed.

        Status: 500
        URL: http://localhost
        Request body: {\\"method\\":\\"eth_blockNumber\\"}

        Details: Internal Server Error
        Version: viem@1.0.2"
      `)
    expect(retryCount).toBe(1)
  })

  test('behavior: retryCount', async () => {
    const start = Date.now()
    let end: number = 0
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
        "HTTP request failed.

        Status: 500
        URL: http://localhost
        Request body: {\\"method\\":\\"eth_blockNumber\\"}

        Details: Internal Server Error
        Version: viem@1.0.2"
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
      "The request took too long to respond.

      URL: http://localhost
      Request body: {\\"method\\":\\"eth_blockNumber\\"}

      Details: The request timed out.
      Version: viem@1.0.2"
    `)
  })
})

test('no url', () => {
  expect(() => http()({})).toThrowErrorMatchingInlineSnapshot(
    `
    "No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.

    Docs: https://viem.sh/docs/clients/intro.html
    Version: viem@1.0.2"
  `,
  )
})
