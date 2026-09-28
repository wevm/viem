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
