import { RpcResponse } from 'ox'
import { describe, expect, test } from 'vitest'

import * as Http from '~test/http.js'
import { RpcClient } from 'viem/utils'
import * as transport from './transport.js'

const withCode = (code: number) => Object.assign(new Error('rpc'), { code })
const withStatus = (status: number) =>
  Object.assign(new Error('http'), { status })

describe('shouldRetry', () => {
  test('retries on retryable JSON-RPC codes', () => {
    for (const code of [-1, -32005, -32007, -32603, 429])
      expect(transport.shouldRetry(withCode(code))).toBe(true)
  })

  test('does not retry on non-retryable codes', () => {
    expect(transport.shouldRetry(withCode(4001))).toBe(false)
  })

  test('retries on retryable HTTP statuses', () => {
    for (const status of [403, 408, 413, 429, 500, 502, 503, 504])
      expect(transport.shouldRetry(withStatus(status))).toBe(true)
  })

  test('does not retry on non-retryable statuses', () => {
    expect(transport.shouldRetry(withStatus(418))).toBe(false)
  })

  test('retries a JSON-RPC error from a non-2xx response by its status', () => {
    const error = (status: number, code = -32000) =>
      new RpcClient.HttpError({
        rpcError: { code, message: 'rpc' },
        status,
        url: 'http://localhost',
      })
    expect({
      retryableCode: transport.shouldRetry(error(400, -32005)),
      retryableStatus: transport.shouldRetry(error(429)),
      nonRetryable: transport.shouldRetry(error(400)),
    }).toMatchInlineSnapshot(`
      {
        "nonRetryable": false,
        "retryableCode": true,
        "retryableStatus": true,
      }
    `)
  })

  test('does not retry a method refusal whatever the HTTP status', () => {
    const error = (status: number, code: number) =>
      new RpcClient.HttpError({
        rpcError: { code, message: 'rpc' },
        status,
        url: 'http://localhost',
      })
    expect({
      limitExceeded: transport.shouldRetry(error(403, -32005)),
      methodNotFound: transport.shouldRetry(
        error(403, RpcResponse.MethodNotFoundError.code),
      ),
      methodNotSupported: transport.shouldRetry(
        error(500, RpcResponse.MethodNotSupportedError.code),
      ),
      rpcError: transport.shouldRetry(error(403, -32000)),
    }).toMatchInlineSnapshot(`
      {
        "limitExceeded": true,
        "methodNotFound": false,
        "methodNotSupported": false,
        "rpcError": true,
      }
    `)
  })

  test('retries when there is no code or status', () => {
    expect(transport.shouldRetry(new Error('network'))).toBe(true)
  })
})

describe('wrapRequest', () => {
  test('dedupes identical in-flight requests', async () => {
    let count = 0
    const server = await Http.createServer((_req, res) => {
      count += 1
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ id: 1, jsonrpc: '2.0', result: '0x1' }))
      }, 50)
    })
    try {
      const client = RpcClient.http(server.url)
      const request = transport.wrapRequest(
        (args) => client.request({ body: args }),
        {
          dedupe: true,
          uid: 'test',
        },
      )
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
    const client = RpcClient.http('http://127.0.0.1:1')
    const controller = new AbortController()
    controller.abort()
    const request = transport.wrapRequest(
      (args) => client.request({ body: args }),
      {
        signal: controller.signal,
      },
    )
    await expect(request({ method: 'eth_blockNumber' })).rejects.toThrow()
  })

  test('honors an include method filter', async () => {
    const client = RpcClient.http('http://127.0.0.1:1')
    const request = transport.wrapRequest(
      (args) => client.request({ body: args }),
      {
        methods: { include: ['eth_chainId'] },
      },
    )
    await expect(request({ method: 'eth_blockNumber' })).rejects.toBeInstanceOf(
      RpcResponse.MethodNotSupportedError,
    )
  })
})
