import * as RpcResponse from 'ox/RpcResponse'
import { describe, expect, test } from 'vitest'

import { createHttpServer } from '~test/utils.js'
import { http } from '../RpcClient.js'
import { shouldRetry, wrapRequest } from './transport.js'

const withCode = (code: number) => Object.assign(new Error('rpc'), { code })
const withStatus = (status: number) =>
  Object.assign(new Error('http'), { status })

describe('shouldRetry', () => {
  test('retries on retryable JSON-RPC codes', () => {
    for (const code of [-1, -32005, -32603, 429])
      expect(shouldRetry(withCode(code))).toBe(true)
  })

  test('does not retry on non-retryable codes', () => {
    expect(shouldRetry(withCode(4001))).toBe(false)
  })

  test('retries on retryable HTTP statuses', () => {
    for (const status of [403, 408, 413, 429, 500, 502, 503, 504])
      expect(shouldRetry(withStatus(status))).toBe(true)
  })

  test('does not retry on non-retryable statuses', () => {
    expect(shouldRetry(withStatus(418))).toBe(false)
  })

  test('retries when there is no code or status', () => {
    expect(shouldRetry(new Error('network'))).toBe(true)
  })
})

describe('wrapRequest', () => {
  test('dedupes identical in-flight requests', async () => {
    let count = 0
    const server = await createHttpServer((_req, res) => {
      count += 1
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ id: 1, jsonrpc: '2.0', result: '0x1' }))
      }, 50)
    })
    try {
      const client = http(server.url)
      const request = wrapRequest((args) => client.request({ body: args }), {
        dedupe: true,
        uid: 'test',
      })
      const [a, b] = await Promise.all([
        request({ method: 'eth_blockNumber' }),
        request({ method: 'eth_blockNumber' }),
      ])
      expect(a).toEqual(b)
      expect(count).toBe(1)
    } finally {
      await server.close()
    }
  })

  test('rejects immediately when the signal is already aborted', async () => {
    const client = http('http://127.0.0.1:1')
    const controller = new AbortController()
    controller.abort()
    const request = wrapRequest((args) => client.request({ body: args }), {
      signal: controller.signal,
    })
    await expect(request({ method: 'eth_blockNumber' })).rejects.toThrow()
  })

  test('honors an include method filter', async () => {
    const client = http('http://127.0.0.1:1')
    const request = wrapRequest((args) => client.request({ body: args }), {
      methods: { include: ['eth_chainId'] },
    })
    await expect(request({ method: 'eth_blockNumber' })).rejects.toBeInstanceOf(
      RpcResponse.MethodNotSupportedError,
    )
  })
})
