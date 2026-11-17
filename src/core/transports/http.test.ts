import { RpcResponse } from 'ox'
import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'
import { Chain, fallback, http, Transport } from 'viem'
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

      expect(error.cause).toBeInstanceOf(RpcClient.HttpError)
      const { headers, status } = error.cause
      expect({
        contentType: headers.get('Content-Type'),
        status,
      }).toMatchInlineSnapshot(`
        {
          "contentType": "application/json",
          "status": 500,
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

  test('does not retry a method refusal with a retryable HTTP status', async () => {
    const errors = []
    for (const error of [
      { code: -32601, message: 'method not allowed' },
      { code: -32004, message: 'method not supported' },
    ]) {
      // A retry would receive the second, successful response.
      const responses = [
        { status: 403, body: { error } },
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
        errors.push(
          await transport
            .request({ method: 'eth_wagmi' })
            .catch((error) => error),
        )
      } finally {
        await server.close()
      }
    }

    expect(errors).toMatchInlineSnapshot(`
      [
        [RpcResponse.MethodNotFoundError: method not allowed],
        [RpcResponse.MethodNotSupportedError: method not supported],
      ]
    `)
  })

  test('retries another JSON-RPC error with a 403 status', async () => {
    // Only the first request is refused.
    const refusals = [{ error: { code: -32000, message: 'rate limited' } }]
    const server = await Http.createServer((_req, res) => {
      const refusal = refusals.shift()
      if (refusal) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(refusal))
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const transport = http(server.url, {
        retryCount: 1,
        retryDelay: 0,
      }).setup()

      const result = await transport.request({ method: 'eth_blockNumber' })

      expect(result).toMatchInlineSnapshot(`"0x1"`)
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

  test('batches separate transports with other headers', async () => {
    const server = await Http.createServer(async (req, res) => {
      let raw = ''
      for await (const chunk of req) raw += chunk
      const requests = JSON.parse(raw) as { id: number }[]
      const result = req.headers.authorization === 'Bearer a' ? '0x1' : '0xa'
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify(
          requests.map(({ id }) => ({ id, jsonrpc: '2.0', result })),
        ),
      )
    })
    try {
      const results = []
      for (const useFallback of [false, true]) {
        const create = (authorization: string) => {
          const transport = http(server.url, {
            batch: true,
            fetchOptions: { headers: { Authorization: authorization } },
            retryCount: 0,
          })
          return (useFallback ? fallback([transport]) : transport).setup()
        }
        const a = create('Bearer a')
        const b = create('Bearer b')
        results.push(
          await Promise.all([
            a.request({ method: 'eth_chainId' }),
            b.request({ method: 'eth_chainId' }),
          ]),
        )
      }

      expect(results).toMatchInlineSnapshot(`
        [
          [
            "0x1",
            "0xa",
          ],
          [
            "0x1",
            "0xa",
          ],
        ]
      `)
    } finally {
      await server.close()
    }
  })

  test('batches requests from the same transport', async () => {
    const server = await Http.createServer(async (req, res) => {
      let raw = ''
      for await (const chunk of req) raw += chunk
      const requests = JSON.parse(raw) as { id: number; method: string }[]
      const result = requests.map(({ method }) => method)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify(
          requests.map(({ id }) => ({ id, jsonrpc: '2.0', result })),
        ),
      )
    })
    try {
      const results = []
      for (const useFallback of [false, true]) {
        const transport = http(server.url, { batch: true })
        const factory = useFallback ? fallback([transport]) : transport
        const a = factory.setup()
        const b = factory.setup()
        results.push(
          await Promise.all([
            a.request({ method: 'eth_a' }),
            b.request({ method: 'eth_b' }),
          ]),
        )
      }

      expect(results).toMatchInlineSnapshot(`
        [
          [
            [
              "eth_a",
              "eth_b",
            ],
            [
              "eth_a",
              "eth_b",
            ],
          ],
          [
            [
              "eth_a",
              "eth_b",
            ],
            [
              "eth_a",
              "eth_b",
            ],
          ],
        ]
      `)
    } finally {
      await server.close()
    }
  })

  test('batches separate chain default URLs of the same transport', async () => {
    const createServer = (result: string) =>
      Http.createServer(async (req, res) => {
        let raw = ''
        for await (const chunk of req) raw += chunk
        const requests = JSON.parse(raw) as { id: number }[]
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify(
            requests.map(({ id }) => ({ id, jsonrpc: '2.0', result })),
          ),
        )
      })
    const a = await createServer('0x1')
    const b = await createServer('0xa')
    try {
      const transport = http(undefined, { batch: true })
      const setup = (url: string) =>
        transport.setup({
          chain: Chain.from({ id: 1, rpcUrls: { http: url } }),
        })

      const results = await Promise.all([
        setup(a.url).request({ method: 'eth_chainId' }),
        setup(b.url).request({ method: 'eth_chainId' }),
      ])

      expect(results).toMatchInlineSnapshot(`
        [
          "0x1",
          "0xa",
        ]
      `)
    } finally {
      await a.close()
      await b.close()
    }
  })

  test('sends fetchOptions.headers given as an object, Headers, or tuples', async () => {
    const server = await Http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        ok({
          authorization: req.headers.authorization,
          contentType: req.headers['content-type'],
        }),
      )
    })
    try {
      const url = new URL(server.url)
      url.username = 'testuser'
      url.password = 'testpass'
      const headers = {
        Authorization: 'Bearer custom-token',
        'cOnTent-TyPe': 'application/custom-json',
      }

      const results = []
      for (const headers_ of [
        headers,
        new Headers(headers),
        Object.entries(headers),
      ]) {
        const transport = http(url.toString(), {
          fetchOptions: { headers: headers_ },
        }).setup()
        results.push(await transport.request({ method: 'eth_chainId' }))
      }

      expect(results).toMatchInlineSnapshot(`
        [
          {
            "authorization": "Bearer custom-token",
            "contentType": "application/custom-json",
          },
          {
            "authorization": "Bearer custom-token",
            "contentType": "application/custom-json",
          },
          {
            "authorization": "Bearer custom-token",
            "contentType": "application/custom-json",
          },
        ]
      `)
    } finally {
      await server.close()
    }
  })

  test('passes plain-object headers to onFetchRequest', async () => {
    const server = await Http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        ok({
          authorization: req.headers.authorization,
          contentType: req.headers['content-type'],
          foo: req.headers['x-foo'],
        }),
      )
    })
    try {
      const url = new URL(server.url)
      url.username = 'testuser'
      url.password = 'testpass'
      const transport = http(url.toString(), {
        onFetchRequest(_, init) {
          return { ...init, headers: { ...init.headers, 'X-Foo': 'bar' } }
        },
      }).setup()

      const result = await transport.request({ method: 'eth_chainId' })

      expect(result).toMatchInlineSnapshot(`
        {
          "authorization": "Basic dGVzdHVzZXI6dGVzdHBhc3M=",
          "contentType": "application/json",
          "foo": "bar",
        }
      `)
    } finally {
      await server.close()
    }
  })
})
