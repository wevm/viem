import { RpcResponse } from 'ox'
import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'
import { Chain, http, Transport } from 'viem'
import { RpcClient } from 'viem/utils'

const url = anvil.mainnet.rpcUrl.http

const ok = (result: unknown) =>
  JSON.stringify({ id: 1, jsonrpc: '2.0', result })

describe('http', () => {
  test('request returns the result', async () => {
    const transport = http(url).setup()
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('batches concurrent requests', async () => {
    const transport = http(url, { batch: true }).setup()
    const [chainId, blockNumber] = await Promise.all([
      transport.request({ method: 'eth_chainId' }),
      transport.request({ method: 'eth_blockNumber' }),
    ])
    expect(chainId).toBe('0x1')
    expect(typeof blockNumber).toBe('string')
  })

  test('maps a JSON-RPC error via ox', async () => {
    const transport = http(url, { retryCount: 0 }).setup()
    await expect(
      transport.request({ method: 'eth_thisDoesNotExist' }),
    ).rejects.toBeInstanceOf(RpcResponse.BaseError)
  })

  test('honors the method filter', async () => {
    const transport = http(url, {
      methods: { exclude: ['eth_accounts'] },
    }).setup()
    await expect(
      transport.request({ method: 'eth_accounts' }),
    ).rejects.toBeInstanceOf(RpcResponse.MethodNotSupportedError)
  })

  test('throws HttpError when the endpoint is unreachable', async () => {
    const transport = http('http://127.0.0.1:1', {
      retryCount: 0,
    }).setup()
    await expect(
      transport.request({ method: 'eth_chainId' }),
    ).rejects.toBeInstanceOf(RpcClient.HttpError)
  })

  test('throws UrlRequiredError without a URL or chain', () => {
    expect(() => http().setup()).toThrowError(Transport.UrlRequiredError)
  })

  test('throws UrlRequiredError when the chain has no RPC URLs', () => {
    const chain = Chain.from({ id: 1 })
    expect(() => http().setup({ chain })).toThrowError(
      Transport.UrlRequiredError,
    )
  })

  test('falls back to the chain default RPC URL', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const chain = Chain.from({
        id: 1,
        name: 'Test',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { http: server.url },
      })
      const transport = http().setup({ chain })
      expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
    } finally {
      await server.close()
    }
  })

  test('raw mode returns the response envelope instead of throwing', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const transport = http(server.url, { raw: true }).setup()
      expect(await transport.request({ method: 'eth_chainId' })).toEqual({
        error: undefined,
        result: '0x1',
      })
    } finally {
      await server.close()
    }
  })

  test('forwards maxResponseBodySize to the RPC client', async () => {
    const body = ok('0x1')
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'application/json',
      })
      res.end(body)
    })
    try {
      const transport = http(server.url, {
        maxResponseBodySize: Buffer.byteLength(body) - 1,
        retryCount: 0,
      }).setup()
      await expect(
        transport.request({ method: 'eth_chainId' }),
      ).rejects.toBeInstanceOf(RpcClient.ResponseBodyTooLargeError)
    } finally {
      await server.close()
    }
  })

  test('retries a retryable HTTP error', async () => {
    let count = 0
    const server = await Http.createServer((_req, res) => {
      count += 1
      if (count <= 2) {
        res.writeHead(500)
        res.end('fail')
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const transport = http(server.url, { retryDelay: 1 }).setup()
      expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
      expect(count).toBe(3)
    } finally {
      await server.close()
    }
  })

  test('honors a Retry-After header on retry', async () => {
    let count = 0
    const server = await Http.createServer((_req, res) => {
      count += 1
      if (count === 1) {
        res.writeHead(429, { 'Retry-After': '0' })
        res.end('slow down')
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const transport = http(server.url, { retryDelay: 1 }).setup()
      expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
      expect(count).toBe(2)
    } finally {
      await server.close()
    }
  })

  test('waits for a Retry-After HTTP-date', async () => {
    // HTTP-dates have whole-second precision.
    const retryAt = Math.ceil(Date.now() / 1000) * 1000 + 1000
    const server = await Http.createServer((_req, res) => {
      // Timers can fire a few ms early.
      if (Date.now() < retryAt - 100) {
        res.writeHead(503, { 'Retry-After': new Date(retryAt).toUTCString() })
        res.end()
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const transport = http(server.url, { retryCount: 1 }).setup()
      expect(
        await transport.request({ method: 'eth_chainId' }),
      ).toMatchInlineSnapshot(`"0x1"`)
    } finally {
      await server.close()
    }
  })

  test('waits for a Retry-After HTTP-date beyond the timer limit', async () => {
    const retryAt = Date.now() + 30 * 24 * 60 * 60 * 1000
    const server = await Http.createServer((_req, res) => {
      res.writeHead(503, { 'Retry-After': new Date(retryAt).toUTCString() })
      res.end()
    })
    try {
      const transport = http(server.url, { retryCount: 1 }).setup()
      await expect(
        transport.request(
          { method: 'eth_chainId' },
          { signal: AbortSignal.timeout(200) },
        ),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TimeoutError: The operation was aborted due to timeout]`,
      )
    } finally {
      await server.close()
    }
  })

  test('backs off for a past Retry-After HTTP-date', async () => {
    const start = Date.now()
    const server = await Http.createServer((_req, res) => {
      // Retries sooner than the backoff get another 503.
      if (Date.now() < start + 100) {
        res.writeHead(503, {
          'Retry-After': new Date(start - 60_000).toUTCString(),
        })
        res.end()
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const transport = http(server.url, {
        retryCount: 1,
        retryDelay: 200,
      }).setup()
      expect(
        await transport.request({ method: 'eth_chainId' }),
      ).toMatchInlineSnapshot(`"0x1"`)
    } finally {
      await server.close()
    }
  })

  test('retries a JSON-RPC error by its HTTP status', async () => {
    // Only the first request is rate limited.
    const rateLimits = [{ error: { code: -32000, message: 'rate limited' } }]
    const server = await Http.createServer((_req, res) => {
      const rateLimit = rateLimits.shift()
      if (rateLimit) {
        res.writeHead(429, {
          'Content-Type': 'application/json',
          'Retry-After': '1',
        })
        res.end(JSON.stringify(rateLimit))
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const transport = http(server.url).setup()

      const start = Date.now()
      const result = await transport.request({ method: 'eth_chainId' })
      const elapsed = Date.now() - start

      expect(result).toMatchInlineSnapshot(`"0x1"`)
      expect(elapsed).toBeGreaterThan(900)
    } finally {
      await server.close()
    }
  })

  test('retries a whole-batch JSON-RPC error by its HTTP status', async () => {
    // Only the first batch is rate limited.
    const rateLimits = [{ error: { code: -32000, message: 'rate limited' } }]
    const server = await Http.createServer((req, res) => {
      let raw = ''
      req.on('data', (chunk) => {
        raw += chunk
      })
      req.on('end', () => {
        const rateLimit = rateLimits.shift()
        if (rateLimit) {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': '1',
          })
          res.end(JSON.stringify(rateLimit))
          return
        }
        const body = JSON.parse(raw)
        const result = (Array.isArray(body) ? body : [body]).map(
          (entry: { id: number; method: string }) => ({
            id: entry.id,
            jsonrpc: '2.0',
            result: entry.method,
          }),
        )
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(Array.isArray(body) ? result : result[0]))
      })
    })
    try {
      const transport = http(server.url, { batch: true }).setup()

      const start = Date.now()
      const results = await Promise.all([
        transport.request({ method: 'eth_chainId' }),
        transport.request({ method: 'eth_blockNumber' }),
      ])
      const elapsed = Date.now() - start

      expect(results).toMatchInlineSnapshot(`
        [
          "eth_chainId",
          "eth_blockNumber",
        ]
      `)
      expect(elapsed).toBeGreaterThan(900)
    } finally {
      await server.close()
    }
  })

  test('maps a whole-batch JSON-RPC error to each request', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          error: { code: -32601, message: 'Method not found' },
        }),
      )
    })
    try {
      const transport = http(server.url, { batch: true, raw: true }).setup()
      expect(
        await Promise.all([
          transport.request({ method: 'eth_chainId' }),
          transport.request({ method: 'eth_blockNumber' }),
        ]),
      ).toMatchInlineSnapshot(`
        [
          {
            "error": {
              "code": -32601,
              "message": "Method not found",
            },
            "result": undefined,
          },
          {
            "error": {
              "code": -32601,
              "message": "Method not found",
            },
            "result": undefined,
          },
        ]
      `)
    } finally {
      await server.close()
    }
  })

  test('raw mode returns a JSON-RPC error from a non-2xx response', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(429, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({ error: { code: -32000, message: 'rate limited' } }),
      )
    })
    try {
      const transport = http(server.url, { raw: true, retryCount: 0 }).setup()
      expect(await transport.request({ method: 'eth_chainId' }))
        .toMatchInlineSnapshot(`
        {
          "error": {
            "code": -32000,
            "message": "rate limited",
          },
          "result": undefined,
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('surfaces the last JSON-RPC error after status retries', async () => {
    // Each attempt reverts with different data, so `0x02` shows the retry.
    const reverts = ['0x01', '0x02']
    const server = await Http.createServer((_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          error: {
            code: 3,
            message: 'execution reverted',
            data: reverts.shift(),
          },
        }),
      )
    })
    try {
      const transport = http(server.url, {
        retryCount: 1,
        retryDelay: 0,
      }).setup()
      const error = await transport
        .request({ method: 'eth_call', params: [{}, 'latest'] })
        .catch((error) => error)
      expect(error).toBeInstanceOf(RpcResponse.BaseError)
      const { code, data, message } = error
      expect({ code, data, message }).toMatchInlineSnapshot(`
        {
          "code": -32603,
          "data": {
            "code": 3,
            "data": "0x02",
            "message": "execution reverted",
          },
          "message": "execution reverted",
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('does not retry a JSON-RPC error with a non-retryable HTTP status', async () => {
    // A retry would receive the second, successful response.
    const responses = [
      {
        status: 400,
        body: { error: { code: -32601, message: 'Method not found' } },
      },
      { status: 200, body: { result: '0x1' } },
    ]
    const server = await Http.createServer((_req, res) => {
      const { status, body } = responses.shift()!
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    })
    try {
      const transport = http(server.url, {
        retryCount: 1,
        retryDelay: 0,
      }).setup()
      await expect(
        transport.request({ method: 'eth_wagmi' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[RpcResponse.MethodNotFoundError: Method not found]`,
      )
    } finally {
      await server.close()
    }
  })

  test('times out when the response body stalls', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.write('{"jsonrpc":"2.0","id":0,')
    })
    try {
      const transport = http(server.url, {
        retryCount: 0,
        timeout: 100,
      }).setup()
      await expect(
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toBeInstanceOf(RpcClient.TimeoutError)
    } finally {
      await server.close()
    }
  })

  test('times out when a request signal is set', async () => {
    const server = await Http.createServer((_req, res) => {
      setTimeout(() => res.end(ok('0x1')), 1_000)
    })
    try {
      const transport = http(server.url, {
        retryCount: 0,
        timeout: 100,
      }).setup()
      const controller = new AbortController()
      await expect(
        transport.request(
          { method: 'eth_blockNumber' },
          { signal: controller.signal },
        ),
      ).rejects.toBeInstanceOf(RpcClient.TimeoutError)
    } finally {
      await server.close()
    }
  })

  test('scopes batches by abort signal', async () => {
    const server = await Http.createServer((req, res) => {
      let raw = ''
      req.on('data', (chunk) => {
        raw += chunk
      })
      req.on('end', () => {
        const body = JSON.parse(raw)
        const result = (Array.isArray(body) ? body : [body]).map((entry) => ({
          id: entry.id,
          jsonrpc: '2.0',
          result: '0x1',
        }))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(Array.isArray(body) ? result : result[0]))
      })
    })
    try {
      const transport = http(server.url, { batch: true }).setup()
      const controller = new AbortController()
      const [a, b] = await Promise.all([
        transport.request(
          { method: 'eth_chainId' },
          { signal: controller.signal },
        ),
        transport.request(
          { method: 'eth_blockNumber' },
          { signal: controller.signal },
        ),
      ])
      expect(a).toBe('0x1')
      expect(b).toBe('0x1')
    } finally {
      await server.close()
    }
  })

  test('accepts batch configuration options', async () => {
    const server = await Http.createServer((req, res) => {
      let raw = ''
      req.on('data', (chunk) => {
        raw += chunk
      })
      req.on('end', () => {
        const body = JSON.parse(raw)
        const result = (Array.isArray(body) ? body : [body]).map((entry) => ({
          id: entry.id,
          jsonrpc: '2.0',
          result: '0x1',
        }))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(Array.isArray(body) ? result : result[0]))
      })
    })
    try {
      const transport = http(server.url, {
        batch: { batchSize: 2, wait: 0 },
      }).setup()
      const [a, b] = await Promise.all([
        transport.request({ method: 'eth_chainId' }),
        transport.request({ method: 'eth_blockNumber' }),
      ])
      expect(a).toBe('0x1')
      expect(b).toBe('0x1')
    } finally {
      await server.close()
    }
  })
})
