import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'
import { http } from 'viem'
import { wait } from '../internal/wait.js'
import * as fallback from './fallback.js'

const url = anvil.mainnet.rpcUrl.http
/** A transport whose endpoint always refuses the connection. */
const dead = () => http('http://127.0.0.1:1')

/** Poll until `fn` returns true, or throw on timeout. */
async function waitFor(fn: () => boolean, timeout = 5_000) {
  const start = Date.now()
  while (!fn()) {
    if (Date.now() - start > timeout) throw new Error('waitFor timeout')
    await wait(10)
  }
}

describe('shouldThrow', () => {
  const withCode = (code: number) => Object.assign(new Error('x'), { code })

  test('rethrows user-rejection and terminal codes', () => {
    for (const code of [4001, 5000, -32003, 7000])
      expect(fallback.shouldThrow(withCode(code))).toBe(true)
  })

  test('rethrows execution-reverted messages', () => {
    expect(
      fallback.shouldThrow(
        Object.assign(new Error('execution reverted'), { code: 3 }),
      ),
    ).toBe(true)
  })

  test('does not rethrow other coded errors', () => {
    expect(fallback.shouldThrow(withCode(-32000))).toBe(false)
  })

  test('does not rethrow errors without a numeric code', () => {
    expect(fallback.shouldThrow(new Error('network'))).toBe(false)
  })
})

describe('fallback', () => {
  test('uses the first transport when it succeeds', async () => {
    const transport = fallback.fallback([http(url)]).setup()
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('falls through to the next transport on error', async () => {
    const transport = fallback.fallback([dead(), http(url)]).setup()
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('rethrows immediately when shouldThrow returns true', async () => {
    const transport = fallback
      .fallback([dead(), http(url)], {
        retryCount: 0,
        shouldThrow: () => true,
      })
      .setup()
    await expect(transport.request({ method: 'eth_chainId' })).rejects.toThrow()
  })

  test('throws when the last transport fails', async () => {
    const transport = fallback
      .fallback([dead(), dead()], { retryCount: 0 })
      .setup()
    await expect(transport.request({ method: 'eth_chainId' })).rejects.toThrow()
  })

  test('does not fall through when the next transport excludes the method', async () => {
    const next = http(url, { methods: { exclude: ['eth_chainId'] } })
    const transport = fallback
      .fallback([dead(), next], { retryCount: 0 })
      .setup()
    await expect(transport.request({ method: 'eth_chainId' })).rejects.toThrow()
  })

  test('falls through when the next transport includes the method', async () => {
    const next = http(url, { methods: { include: ['eth_chainId'] } })
    const transport = fallback.fallback([dead(), next]).setup()
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('treats an empty method filter as supporting everything', async () => {
    const next = http(url, { methods: {} })
    const transport = fallback.fallback([dead(), next]).setup()
    expect(await transport.request({ method: 'eth_chainId' })).toBe('0x1')
  })

  test('invokes onResponse for each attempt', async () => {
    const statuses: string[] = []
    const transport = fallback.fallback([dead(), http(url)]).setup()
    transport.onResponse((response) => statuses.push(response.status))
    await transport.request({ method: 'eth_chainId' })
    expect(statuses).toEqual(['error', 'success'])
  })

  test('exposes the inner transport instances', () => {
    const transport = fallback.fallback([http(url), http(url)]).setup()
    expect(transport.transports).toHaveLength(2)
  })

  test('rank: enabling ranking still serves requests', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ result: '0x1' }))
    })
    const transport = fallback
      .fallback([http(server.url)], {
        rank: { interval: 100 },
      })
      .setup({ chain: undefined })

    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')
    await server.close()
  })

  test('rank: true uses defaults', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ result: '0x1' }))
    })
    const transport = fallback
      .fallback([http(server.url)], { rank: true })
      .setup()

    expect(await transport.request({ method: 'eth_blockNumber' })).toBe('0x1')
    await server.close()
  })
})

describe('rankTransports', () => {
  test('ranks healthy/fast transports ahead of unhealthy ones', async () => {
    const healthy = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ result: true }))
    })
    const unhealthy = await Http.createServer((_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { code: -1, message: 'fail' } }))
    })

    const rankings: string[][] = []
    fallback.rankTransports({
      chain: undefined,
      interval: 10,
      sampleCount: 2,
      timeout: 500,
      transports: [
        http(unhealthy.url, { key: 'unhealthy' }),
        http(healthy.url, { key: 'healthy' }),
      ],
      onTransports: (transports) =>
        rankings.push(transports.map((transport) => transport.key)),
    })

    await waitFor(() => rankings.length >= 3)
    expect(rankings.at(-1)).toEqual(['healthy', 'unhealthy'])

    await healthy.close()
    await unhealthy.close()
  })

  test('weights: stability-only weighting still orders by success', async () => {
    const healthy = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ result: true }))
    })
    const unhealthy = await Http.createServer((_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { code: -1, message: 'fail' } }))
    })

    const rankings: string[][] = []
    fallback.rankTransports({
      interval: 10,
      timeout: 500,
      transports: [
        http(unhealthy.url, { key: 'unhealthy' }),
        http(healthy.url, { key: 'healthy' }),
      ],
      weights: { latency: 0, stability: 1 },
      onTransports: (transports) =>
        rankings.push(transports.map((transport) => transport.key)),
    })

    await waitFor(() => rankings.length >= 2)
    expect(rankings.at(-1)).toEqual(['healthy', 'unhealthy'])

    await healthy.close()
    await unhealthy.close()
  })

  test('custom ping: invokes the provided ping function', async () => {
    const methods: string[] = []
    const server = await Http.createServer((req, res) => {
      req.setEncoding('utf8')
      req.on('data', (body) => {
        methods.push(JSON.parse(body).method)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ result: '0x1' }))
      })
    })

    let count = 0
    fallback.rankTransports({
      interval: 10,
      transports: [http(server.url)],
      onTransports: () => {},
      ping: ({ transport }) => {
        count++
        return transport.request({
          method: count % 2 === 0 ? 'eth_blockNumber' : 'eth_getBlockByNumber',
        })
      },
    })

    await waitFor(() => methods.length >= 2)
    expect(methods.slice(0, 2)).toEqual([
      'eth_getBlockByNumber',
      'eth_blockNumber',
    ])

    await server.close()
  })
})
