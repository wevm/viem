import { assertType, describe, expect, test } from 'vitest'
import { localhost } from '../../chains.js'
import { createHttpServer } from '../../_test/index.js'
import { createClient } from '../createClient.js'
import { createPublicClient } from '../createPublicClient.js'

import { getBlockNumber } from '../../actions/index.js'
import { wait } from '../../utils/wait.js'
import type { Transport } from './createTransport.js'
import type { FallbackTransport } from './fallback.js'
import { fallback, rankTransports } from './fallback.js'
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

    let transport = fallback([http(server1.url), http(server3.url)], {
      rank: false,
    })({
      chain: localhost,
    })
    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(2)

    count = 0
    transport = fallback(
      [http(server1.url), http(server2.url), http(server3.url)],
      {
        rank: false,
      },
    )({
      chain: localhost,
    })
    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(3)

    count = 0
    transport = fallback([http(server1.url), http(server2.url)], {
      rank: false,
    })({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(8)
  })

  test('error (rpc)', async () => {
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

    const transport = fallback(
      [http(server1.url), http(server2.url), http(server3.url)],
      {
        rank: false,
      },
    )({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    expect(count).toBe(1)
  })

  test('error (rpc - non deterministic)', async () => {
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

    const transport = fallback([http(server1.url), http(server2.url)], {
      rank: false,
    })({
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

    const transport = fallback([http(server1.url), http(server2.url)], {
      rank: false,
    })({
      chain: localhost,
    })
    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()

    // ensure `retryCount` on transport is adhered
    expect(count).toBe(8)
  })

  test('all error (rpc - non deterministic)', async () => {
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

    const transport = fallback([http(server1.url), http(server2.url)], {
      rank: false,
    })({
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
      rank: false,
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
        rank: false,
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
        "chain": undefined,
        "key": "base",
        "name": "Base Client",
        "pollingInterval": 4000,
        "request": [Function],
        "transport": {
          "key": "fallback",
          "name": "Fallback",
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

    const transport = fallback([http(server1.url), http(server2.url)], {
      rank: false,
    })
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

    const transport = fallback([http(server1.url), http(server2.url)], {
      rank: false,
    })
    const client = createPublicClient({ chain: localhost, transport })

    await expect(
      getBlockNumber(client),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "An internal error was received.

      URL: http://localhost
      Request body: {\\"method\\":\\"eth_blockNumber\\"}

      Details: sad times
      Version: viem@1.0.2"
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

    const rankedTransports: Transport[][] = []

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
})
