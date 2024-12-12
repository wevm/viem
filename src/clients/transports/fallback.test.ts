import { assertType, describe, expect, test } from 'vitest'

import { createHttpServer } from '~test/src/utils.js'
import { getBlockNumber } from '../../actions/public/getBlockNumber.js'
import { localhost } from '../../chains/index.js'
import {
  MethodNotSupportedRpcError,
  UserRejectedRequestError,
} from '../../errors/rpc.js'
import { wait } from '../../utils/wait.js'
import { createClient } from '../createClient.js'
import { createPublicClient } from '../createPublicClient.js'
import type { Transport } from './createTransport.js'
import {
  type FallbackTransport,
  type OnResponseFn,
  fallback,
  rankTransports,
} from './fallback.js'
import { http } from './http.js'

test('default', () => {
  const alchemy = http('https://alchemy.com/rpc')
  const infura = http('https://infura.com/rpc')
  const transport = fallback([alchemy, infura])

  assertType<FallbackTransport>(transport)
  assertType<'fallback'>(transport({}).config.type)

  expect(transport({})).toMatchInlineSnapshot(`
    {
      "config": {
        "key": "fallback",
        "name": "Fallback",
        "request": [Function],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "fallback",
      },
      "request": [Function],
      "value": {
        "onResponse": [Function],
        "transports": [
          {
            "config": {
              "key": "http",
              "name": "HTTP JSON-RPC",
              "request": [Function],
              "retryCount": 0,
              "retryDelay": 150,
              "timeout": 10000,
              "type": "http",
            },
            "request": [Function],
            "value": {
              "fetchOptions": undefined,
              "url": "https://alchemy.com/rpc",
            },
          },
          {
            "config": {
              "key": "http",
              "name": "HTTP JSON-RPC",
              "request": [Function],
              "retryCount": 0,
              "retryDelay": 150,
              "timeout": 10000,
              "type": "http",
            },
            "request": [Function],
            "value": {
              "fetchOptions": undefined,
              "url": "https://infura.com/rpc",
            },
          },
        ],
      },
    }
  `)
})

describe('request', () => {
  test('default', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const local = http(server.url)
    const transport = fallback([local])({ chain: localhost })

    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')
  })

  test('error', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })
    const server3 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    let transport = fallback([http(server1.url), http(server3.url)])({
      chain: localhost,
    }) as ReturnType<FallbackTransport>
    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(2)

    count = 0
    transport = fallback([
      http(server1.url),
      http(server2.url),
      http(server3.url),
    ])({
      chain: localhost,
    })
    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(3)

    count = 0
    transport = fallback([http(server1.url), http(server2.url)])({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(8)
  })

  test('onResponse', async () => {
    const server1 = await createHttpServer((_req, res) => {
      res.writeHead(500)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      res.writeHead(500)
      res.end()
    })
    const server3 = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = fallback([
      http(server1.url),
      http(server2.url),
      http(server3.url),
    ])({
      chain: localhost,
    })

    const args: Parameters<OnResponseFn>[0][] = []
    transport.value?.onResponse((args_) => args.push(args_))

    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')
    expect(
      args.map(({ transport: _transport, ...rest }) => rest),
    ).toMatchInlineSnapshot(`
      [
        {
          "error": [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: {"method":"eth_blockNumber"}

      Details: Internal Server Error
      Version: viem@x.y.z],
          "method": "eth_blockNumber",
          "params": undefined,
          "status": "error",
        },
        {
          "error": [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: {"method":"eth_blockNumber"}

      Details: Internal Server Error
      Version: viem@x.y.z],
          "method": "eth_blockNumber",
          "params": undefined,
          "status": "error",
        },
        {
          "method": "eth_blockNumber",
          "params": undefined,
          "response": "0x1",
          "status": "success",
        },
      ]
    `)
  })

  test('error (rpc)', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: { code: UserRejectedRequestError.code, message: 'sad times' },
        }),
      )
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })
    const server3 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = fallback([
      http(server1.url),
      http(server2.url),
      http(server3.url),
    ])({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    expect(count).toBe(1)
  })

  test('error (rpc - fallthrough)', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: 'ngmi' }))
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: MethodNotSupportedRpcError.code,
            message: 'sad times',
          },
        }),
      )
    })
    const server3 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = fallback([
      http(server1.url),
      http(server2.url),
      http(server3.url),
    ])({
      chain: localhost,
    })
    expect(
      await transport.request({ method: 'eth_blockNumber' }),
    ).toMatchInlineSnapshot('"0x1"')

    expect(count).toBe(3)
  })

  test('error (rpc - fallthrough)', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: { code: -32603, message: 'sad times' } }))
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = fallback([http(server1.url), http(server2.url)])({
      chain: localhost,
    })
    expect(
      await transport.request({ method: 'eth_blockNumber' }),
    ).toMatchInlineSnapshot('"0x1"')

    expect(count).toBe(2)
  })

  test('error (rpc - fallthrough)', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(404)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = fallback([http(server1.url), http(server2.url)])({
      chain: localhost,
    })
    expect(
      await transport.request({ method: 'eth_blockNumber' }),
    ).toMatchInlineSnapshot('"0x1"')

    expect(count).toBe(2)
  })

  test('all error', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })

    const transport = fallback([http(server1.url), http(server2.url)])({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(8)
  })

  test('all error (rpc - fallthrough)', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: { code: -32603, message: 'sad times' } }))
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: { code: -32603, message: 'sad times' } }))
    })

    const transport = fallback([http(server1.url), http(server2.url)])({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    expect(count).toBe(8)
  })

  test('retryCount', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })

    const transport = fallback([http(server1.url), http(server2.url)], {
      retryCount: 1,
    })({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(4)
  })

  test('retryCount (on child transport)', async () => {
    let server1Count = 0
    let server2Count = 0
    const server1 = await createHttpServer((_req, res) => {
      server1Count++
      res.writeHead(500)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      server2Count++
      res.writeHead(500)
      res.end()
    })

    const transport = fallback(
      [
        http(server1.url, { retryCount: 3 }),
        http(server2.url, { retryCount: 2 }),
      ],
      {
        retryCount: 0,
      },
    )({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    // ensure `retryCount` on transport is adhered
    expect(server1Count).toBe(4)
    expect(server2Count).toBe(3)
  })

  test('rank', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const local = http(server.url)
    const transport = fallback([local], { rank: { interval: 500 } })({
      chain: localhost,
    })

    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')
  })
})

describe('client', () => {
  test('default', () => {
    const alchemy = http('https://alchemy.com/rpc')
    const infura = http('https://infura.com/rpc')
    const transport = fallback([alchemy, infura])

    const { uid: _uid, ...client } = createClient({
      transport,
    })

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
          "key": "fallback",
          "name": "Fallback",
          "onResponse": [Function],
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "transports": [
            {
              "config": {
                "key": "http",
                "name": "HTTP JSON-RPC",
                "request": [Function],
                "retryCount": 0,
                "retryDelay": 150,
                "timeout": 10000,
                "type": "http",
              },
              "request": [Function],
              "value": {
                "fetchOptions": undefined,
                "url": "https://alchemy.com/rpc",
              },
            },
            {
              "config": {
                "key": "http",
                "name": "HTTP JSON-RPC",
                "request": [Function],
                "retryCount": 0,
                "retryDelay": 150,
                "timeout": 10000,
                "type": "http",
              },
              "request": [Function],
              "value": {
                "fetchOptions": undefined,
                "url": "https://infura.com/rpc",
              },
            },
          ],
          "type": "fallback",
        },
        "type": "base",
      }
    `)
  })

  test('request', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const local = http(server.url)
    const transport = fallback([local])
    const client = createPublicClient({ chain: localhost, transport })

    expect(await getBlockNumber(client)).toBe(1n)
  })

  test('request (error)', async () => {
    const server1 = await createHttpServer((_req, res) => {
      res.writeHead(500)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      res.writeHead(500)
      res.end()
    })
    const server3 = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = fallback([
      http(server1.url),
      http(server2.url),
      http(server3.url),
    ])
    const client = createPublicClient({ chain: localhost, transport })

    expect(await getBlockNumber(client)).toBe(1n)
  })

  test('error (non deterministic)', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: { code: -32603, message: 'sad times' } }))
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = fallback([http(server1.url), http(server2.url)])
    const client = createPublicClient({ chain: localhost, transport })

    expect(await getBlockNumber(client)).toBe(1n)
    expect(count).toBe(2)
  })

  test('all error (non deterministic)', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: { code: -32603, message: 'sad times' } }))
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: { code: -32603, message: 'sad times' } }))
    })

    const transport = fallback([http(server1.url), http(server2.url)])
    const client = createPublicClient({ chain: localhost, transport })

    await expect(
      getBlockNumber(client),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [InternalRpcError: An internal error was received.

      URL: http://localhost
      Request body: {"method":"eth_blockNumber"}

      Details: sad times
      Version: viem@x.y.z]
    `)
    expect(count).toBe(8)
  })
})

describe('rankTransports', () => {
  const samples: [responseTime: number, success: boolean][][] = [
    [
      [100, true],
      [50, true],
      [300, true],
    ],
    [
      [200, false],
      [20, true],
      [200, true],
    ],
    [
      [300, false],
      [40, true],
      [2000, true],
    ],
    [
      [100, true],
      [50, true],
      [100, true],
    ],
    [
      [300, false],
      [90, true],
      [300, true],
    ],
    [
      [200, true],
      [100, true],
      [200, true],
    ],
    [
      [100, true],
      [120, true],
      [300, false],
    ],
    [
      [300, true],
      [40, true],
      [100, false],
    ],
    [
      [200, true],
      [50, true],
      [300, true],
    ],
    [
      [300, true],
      [20, true],
      [300, false],
    ],
  ]

  test('default', async () => {
    let count1 = 0
    const server1 = await createHttpServer((_req, res) => {
      if (count3 >= samples.length) return
      const [responseTime, success] = samples[count1][0]
      count1++
      setTimeout(() => {
        res.writeHead(success ? 200 : 500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ result: true }))
      }, responseTime)
    })

    let count2 = 0
    const server2 = await createHttpServer((_req, res) => {
      if (count2 >= samples.length) return
      const [responseTime, success] = samples[count2][1]
      count2++
      setTimeout(() => {
        res.writeHead(success ? 200 : 500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ result: true }))
      }, responseTime)
    })

    let count3 = 0
    const server3 = await createHttpServer((_req, res) => {
      if (count3 >= samples.length) return
      const [responseTime, success] = samples[count3][2]
      count3++
      setTimeout(() => {
        res.writeHead(success ? 200 : 500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ result: true }))
      }, responseTime)
    })

    const transport1 = http(server1.url, { key: '1' })
    const transport2 = http(server2.url, { key: '2' })
    const transport3 = http(server3.url, { key: '3' })

    const rankedTransports: (readonly Transport[])[] = []

    rankTransports({
      chain: localhost,
      interval: 10,
      sampleCount: 5,
      timeout: 500,
      transports: [transport1, transport2, transport3],
      onTransports(transports) {
        rankedTransports.push(transports)
      },
    })

    await wait(3900)

    const rankedKeys = rankedTransports.map((transports) =>
      transports.map((transport) => transport({ chain: undefined }).config.key),
    )
    expect(rankedKeys).toMatchInlineSnapshot(`
      [
        [
          "2",
          "1",
          "3",
        ],
        [
          "2",
          "3",
          "1",
        ],
        [
          "2",
          "3",
          "1",
        ],
        [
          "2",
          "3",
          "1",
        ],
        [
          "2",
          "3",
          "1",
        ],
        [
          "2",
          "3",
          "1",
        ],
        [
          "2",
          "1",
          "3",
        ],
        [
          "2",
          "1",
          "3",
        ],
        [
          "2",
          "1",
          "3",
        ],
        [
          "2",
          "1",
          "3",
        ],
        [
          "2",
          "1",
          "3",
        ],
      ]
    `)
  })

  test('behavior: custom ping', async () => {
    const results: { method: string }[] = []

    const server = await createHttpServer((req, res) => {
      req.setEncoding('utf8')
      req.on('data', (body) => {
        results.push(JSON.parse(body))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ result: '0x1' }))
      })
    })

    const transport1 = http(server.url, { key: '1' })

    let count = 0
    rankTransports({
      chain: localhost,
      interval: 10,
      transports: [transport1],
      onTransports() {},
      ping({ transport }) {
        count++
        return transport.request({
          method: count % 2 === 0 ? 'eth_blockNumber' : 'eth_getBlockByNumber',
        })
      },
    })

    await wait(20)

    expect(results.map((r) => r.method)).toMatchInlineSnapshot(`
      [
        "eth_getBlockByNumber",
        "eth_blockNumber",
      ]
    `)
  })
})
