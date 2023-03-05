import { assertType, describe, expect, test } from 'vitest'
import { createHttpServer, localHttpUrl } from '../../_test'
import { localhost } from '../../chains'
import { createClient } from '../createClient'

import { getBlockNumber } from '../../actions'
import { fallback, FallbackTransport } from './fallback'
import { http } from './http'

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

    let transport = fallback([http(server1.url), http(server3.url)])({
      chain: localhost,
    })
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

    let transport = fallback([
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

    let transport = fallback([http(server1.url), http(server2.url)])({
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

    let transport = fallback([http(server1.url), http(server2.url)])({
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

    let transport = fallback([http(server1.url), http(server2.url)])({
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

    let transport = fallback([http(server1.url), http(server2.url)], {
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

    let transport = fallback(
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
})

describe('client', () => {
  test('default', () => {
    const alchemy = http('https://alchemy.com/rpc')
    const infura = http('https://infura.com/rpc')
    const transport = fallback([alchemy, infura])

    const { uid, ...client } = createClient({
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
    const client = createClient({ chain: localhost, transport })

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
    const client = createClient({ chain: localhost, transport })

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

    let transport = fallback([http(server1.url), http(server2.url)])
    const client = createClient({ chain: localhost, transport })

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

    let transport = fallback([http(server1.url), http(server2.url)])
    const client = createClient({ chain: localhost, transport })

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
