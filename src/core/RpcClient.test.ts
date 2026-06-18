import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { createHttpServer } from '~test/utils.js'
import { http, HttpError, TimeoutError } from './RpcClient.js'

const ok = (result: unknown) =>
  JSON.stringify({ id: 1, jsonrpc: '2.0', result })

describe('http', () => {
  test('sends a single request', async () => {
    const client = http(anvilMainnet.rpcUrl.http)
    const response = await client.request({ body: { method: 'eth_chainId' } })
    expect(response.result).toBe('0x1')
  })

  test('sends a batch request', async () => {
    const client = http(anvilMainnet.rpcUrl.http)
    const responses = await client.request({
      body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
    })
    expect(responses).toHaveLength(2)
    expect(responses.every((response) => 'result' in response)).toBe(true)
  })

  test('returns a JSON-RPC error in the response body', async () => {
    const client = http(anvilMainnet.rpcUrl.http)
    const response = await client.request({
      body: { method: 'eth_thisDoesNotExist' },
    })
    expect(typeof response.error?.code).toBe('number')
  })

  test('returns a non-ok response that carries a valid JSON-RPC error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { code: -32602, message: 'bad' } }))
    })
    try {
      const response = await http(server.url).request({
        body: { method: 'eth_chainId' },
      })
      expect(response.error?.code).toBe(-32602)
    } finally {
      await server.close()
    }
  })

  test('throws HttpError on a non-ok response without a JSON-RPC error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ oops: true }))
    })
    try {
      const error = (await http(server.url)
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as HttpError
      expect(error).toBeInstanceOf(HttpError)
      expect(error.status).toBe(500)
    } finally {
      await server.close()
    }
  })

  test('throws HttpError on a non-ok, non-JSON response', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(502, { 'Content-Type': 'text/plain' })
      res.end('Bad Gateway')
    })
    try {
      const error = (await http(server.url)
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as HttpError
      expect(error).toBeInstanceOf(HttpError)
      expect(error.status).toBe(502)
    } finally {
      await server.close()
    }
  })

  test('throws on an ok response with an unparseable body', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('not json')
    })
    try {
      const error = (await http(server.url)
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as HttpError
      expect(error).toBeInstanceOf(HttpError)
    } finally {
      await server.close()
    }
  })

  test('throws TimeoutError when the response is too slow', async () => {
    const server = await createHttpServer((_req, res) => {
      setTimeout(() => res.end(ok('0x1')), 200)
    })
    try {
      const error = (await http(server.url, { timeout: 50 })
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as TimeoutError
      expect(error).toBeInstanceOf(TimeoutError)
    } finally {
      await server.close()
    }
  })

  test('aborts when the caller-provided signal aborts', async () => {
    const server = await createHttpServer((_req, res) => {
      setTimeout(() => res.end(ok('0x1')), 200)
    })
    try {
      const controller = new AbortController()
      const promise = http(server.url)
        .request({
          body: { method: 'eth_chainId' },
          fetchOptions: { signal: controller.signal },
        })
        .catch((error) => error as Error)
      controller.abort()
      expect(await promise).toBeInstanceOf(Error)
    } finally {
      await server.close()
    }
  })

  test('sends Basic auth credentials parsed from the URL', async () => {
    let authorization: string | undefined
    const server = await createHttpServer((req, res) => {
      authorization = req.headers.authorization
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const url = new URL(server.url)
      await http(`${url.protocol}//alice:secret@${url.host}`).request({
        body: { method: 'eth_chainId' },
      })
      expect(authorization).toBe(`Basic ${btoa('alice:secret')}`)
    } finally {
      await server.close()
    }
  })

  test('wraps a malformed URL / fetch failure in HttpError', async () => {
    const error = (await http('not-a-valid-url')
      .request({ body: { method: 'eth_chainId' } })
      .catch((error) => error)) as HttpError
    expect(error).toBeInstanceOf(HttpError)
  })

  test('invokes onRequest and onResponse callbacks', async () => {
    let requested = false
    let responded = false
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      await http(server.url, {
        onRequest: () => {
          requested = true
        },
        onResponse: () => {
          responded = true
        },
      }).request({ body: { method: 'eth_chainId' } })
      expect(requested).toBe(true)
      expect(responded).toBe(true)
    } finally {
      await server.close()
    }
  })

  test('handles an ok response with an empty body', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('')
    })
    try {
      const response = await http(server.url).request({
        body: { method: 'eth_chainId' },
      })
      expect(response).toEqual({})
    } finally {
      await server.close()
    }
  })

  test('does not time out when the timeout is 0', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const response = await http(server.url, { timeout: 0 }).request({
        body: { method: 'eth_chainId' },
      })
      expect(response.result).toBe('0x1')
    } finally {
      await server.close()
    }
  })

  test('falls back to the base URL when onRequest omits one', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const response = await http(server.url, {
        onRequest: (_request, init) => init,
      }).request({ body: { method: 'eth_chainId' } })
      expect(response.result).toBe('0x1')
    } finally {
      await server.close()
    }
  })
})
