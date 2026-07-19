import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'
import * as Ws from '~test/ws.js'
import { Actions } from 'viem'
import { RpcClient } from 'viem/utils'

const ok = (result: unknown) =>
  JSON.stringify({ id: 1, jsonrpc: '2.0', result })

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const ws = anvil.mainnet.rpcUrl.ws
const client = anvil.getClient(anvil.mainnet)

describe('http', () => {
  test('sends a single request', async () => {
    const client = RpcClient.http(anvil.mainnet.rpcUrl.http)
    const response = await client.request({ body: { method: 'eth_chainId' } })
    expect(response.result).toBe('0x1')
  })

  test('sends a batch request', async () => {
    const client = RpcClient.http(anvil.mainnet.rpcUrl.http)
    const responses = await client.request({
      body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
    })
    expect(responses).toHaveLength(2)
    expect(responses.every((response) => 'result' in response)).toBe(true)
  })

  test('returns a JSON-RPC error in the response body', async () => {
    const client = RpcClient.http(anvil.mainnet.rpcUrl.http)
    const response = await client.request({
      body: { method: 'eth_thisDoesNotExist' },
    })
    expect(typeof response.error?.code).toBe('number')
  })

  test('returns a non-ok response that carries a valid JSON-RPC error', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: { code: -32602, message: 'bad' } }))
    })
    try {
      const response = await RpcClient.http(server.url).request({
        body: { method: 'eth_chainId' },
      })
      expect(response.error?.code).toBe(-32602)
    } finally {
      await server.close()
    }
  })

  test('throws HttpError on a non-ok response without a JSON-RPC error', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ oops: true }))
    })
    try {
      const error = (await RpcClient.http(server.url)
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as RpcClient.HttpError
      expect(error).toBeInstanceOf(RpcClient.HttpError)
      expect(error.status).toBe(500)
    } finally {
      await server.close()
    }
  })

  test('throws HttpError on a non-ok, non-JSON response', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(502, { 'Content-Type': 'text/plain' })
      res.end('Bad Gateway')
    })
    try {
      const error = (await RpcClient.http(server.url)
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as RpcClient.HttpError
      expect(error).toBeInstanceOf(RpcClient.HttpError)
      expect(error.status).toBe(502)
    } finally {
      await server.close()
    }
  })

  test('throws on an ok response with an unparseable body', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('not json')
    })
    try {
      const error = (await RpcClient.http(server.url)
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as RpcClient.HttpError
      expect(error).toBeInstanceOf(RpcClient.HttpError)
    } finally {
      await server.close()
    }
  })

  test('throws ResponseBodyTooLargeError when the body exceeds maxResponseBodySize', async () => {
    const body = ok('0x1')
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'application/json',
      })
      res.end(body)
    })
    try {
      const error = (await RpcClient.http(server.url, {
        maxResponseBodySize: body.length - 1,
      })
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as RpcClient.ResponseBodyTooLargeError
      expect(error).toBeInstanceOf(RpcClient.ResponseBodyTooLargeError)
      expect(error.maxSize).toBe(body.length - 1)
      expect(error.size).toBe(body.length)
    } finally {
      await server.close()
    }
  })

  test('reads the full body when maxResponseBodySize is disabled', async () => {
    const body = ok('0x1')
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'application/json',
      })
      res.end(body)
    })
    try {
      const response = await RpcClient.http(server.url, {
        maxResponseBodySize: false,
      }).request({ body: { method: 'eth_chainId' } })
      expect(response.result).toBe('0x1')
    } finally {
      await server.close()
    }
  })

  test('throws TimeoutError when the response is too slow', async () => {
    const server = await Http.createServer((_req, res) => {
      setTimeout(() => res.end(ok('0x1')), 200)
    })
    try {
      const error = (await RpcClient.http(server.url, { timeout: 50 })
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error)) as RpcClient.TimeoutError
      expect(error).toBeInstanceOf(RpcClient.TimeoutError)
    } finally {
      await server.close()
    }
  })

  test('aborts when the caller-provided signal aborts', async () => {
    const server = await Http.createServer((_req, res) => {
      setTimeout(() => res.end(ok('0x1')), 200)
    })
    try {
      const controller = new AbortController()
      const promise = RpcClient.http(server.url)
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

  test('rethrows an abort error raised by fetch', async () => {
    const server = await Http.createServer((_req, res) => {
      res.end(ok('0x1'))
    })
    try {
      const error = await RpcClient.http(server.url, {
        // Inject an already-aborted signal so fetch raises an AbortError,
        // without the caller-provided `signal` being set.
        onRequest: (_request, init) =>
          ({ ...init, signal: AbortSignal.abort() }) as any,
      })
        .request({ body: { method: 'eth_chainId' } })
        .catch((error) => error as Error)
      expect((error as Error).name).toBe('AbortError')
    } finally {
      await server.close()
    }
  })

  test('sends Basic auth credentials parsed from the URL', async () => {
    let authorization: string | undefined
    const server = await Http.createServer((req, res) => {
      authorization = req.headers.authorization
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const url = new URL(server.url)
      await RpcClient.http(`${url.protocol}//alice:secret@${url.host}`).request(
        {
          body: { method: 'eth_chainId' },
        },
      )
      expect(authorization).toBe(`Basic ${btoa('alice:secret')}`)
    } finally {
      await server.close()
    }
  })

  test('wraps a malformed URL / fetch failure in HttpError', async () => {
    const error = (await RpcClient.http('not-a-valid-url')
      .request({ body: { method: 'eth_chainId' } })
      .catch((error) => error)) as RpcClient.HttpError
    expect(error).toBeInstanceOf(RpcClient.HttpError)
  })

  test('invokes onRequest and onResponse callbacks', async () => {
    let requested = false
    let responded = false
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      await RpcClient.http(server.url, {
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
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('')
    })
    try {
      const response = await RpcClient.http(server.url).request({
        body: { method: 'eth_chainId' },
      })
      expect(response).toEqual({})
    } finally {
      await server.close()
    }
  })

  test('does not time out when the timeout is 0', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const response = await RpcClient.http(server.url, { timeout: 0 }).request(
        {
          body: { method: 'eth_chainId' },
        },
      )
      expect(response.result).toBe('0x1')
    } finally {
      await server.close()
    }
  })

  test('falls back to the base URL when onRequest omits one', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(ok('0x1'))
    })
    try {
      const response = await RpcClient.http(server.url, {
        onRequest: (_request, init) => init,
      }).request({ body: { method: 'eth_chainId' } })
      expect(response.result).toBe('0x1')
    } finally {
      await server.close()
    }
  })
})

describe('webSocket', () => {
  describe('cache + lifecycle', () => {
    test('returns the same cached client for identical options', async () => {
      const a = await RpcClient.webSocket(ws, { keepAlive: false })
      const b = await RpcClient.webSocket(ws, { keepAlive: false })
      expect(a).toBe(b)
      a.close()
    })

    // Asserting a single underlying connection requires a server we can
    // introspect, which anvil does not expose.
    test('dedupes concurrent client creation into one connection', async () => {
      const server = await Ws.createServer(() => {})
      try {
        const [a, b] = await Promise.all([
          RpcClient.webSocket(server.url, { keepAlive: false }),
          RpcClient.webSocket(server.url, { keepAlive: false }),
        ])
        expect(a).toBe(b)
        await wait(20)
        expect(server.connections.length).toBe(1)
        a.close()
      } finally {
        await server.close()
      }
    })

    test('does not share clients across different options', async () => {
      const a = await RpcClient.webSocket(ws, { keepAlive: false })
      const b = await RpcClient.webSocket(ws, {
        keepAlive: { interval: 1_000 },
      })
      expect(a).not.toBe(b)
      a.close()
      b.close()
    })

    test('close evicts the client from the cache', async () => {
      const a = await RpcClient.webSocket(ws, { keepAlive: false })
      a.close()
      const b = await RpcClient.webSocket(ws, { keepAlive: false })
      expect(a).not.toBe(b)
      b.close()
    })

    test('close is idempotent', async () => {
      const client = await RpcClient.webSocket(ws, { keepAlive: false })
      expect(() => {
        client.close()
        client.close()
      }).not.toThrow()
    })

    test('exposes url, socket, and the request/subscription maps', async () => {
      const client = await RpcClient.webSocket(ws, { keepAlive: false })
      expect(client.url).toBe(ws)
      expect(client.socket).toBeDefined()
      expect(client.requests).toBeInstanceOf(Map)
      expect(client.subscriptions).toBeInstanceOf(Map)
      client.close()
    })
  })

  describe('request', () => {
    test('sends a finalized JSON-RPC request frame', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        connection.send(
          JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
        )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        await client.request({ body: { method: 'eth_chainId' } })
        expect(JSON.parse(server.connections[0]!.messages[0]!)).toEqual({
          jsonrpc: '2.0',
          id: 0,
          method: 'eth_chainId',
        })
        client.close()
      } finally {
        await server.close()
      }
    })

    test('honors an explicit body id', async () => {
      const client = await RpcClient.webSocket(ws, { keepAlive: false })
      const response = await client.request({
        body: { id: 99, method: 'eth_chainId' },
      })
      expect(response.id).toBe(99)
      expect(response.result).toBe('0x1')
      client.close()
    })

    test('preserves an explicit id of 0', async () => {
      const client = await RpcClient.webSocket(ws, { keepAlive: false })
      const response = await client.request({
        body: { id: 0, method: 'eth_chainId' },
      })
      expect(response.id).toBe(0)
      client.close()
    })

    test('uses one id sequence for requests and subscriptions', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_chainId')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
          )
        if (request.method === 'eth_subscribe')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
        if (request.method === 'eth_unsubscribe')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: true }),
          )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        await client.request({ body: { method: 'eth_chainId' } })
        const sub = await client.subscribe({
          params: ['newHeads'],
        })
        await sub.unsubscribe()
        const ids = server.connections[0]!.messages.map((m) => JSON.parse(m).id)
        expect(ids).toEqual([0, 1, 2])
        client.close()
      } finally {
        await server.close()
      }
    })

    test('routes concurrent responses to the matching request by id', async () => {
      const server = await Ws.createServer((connection) => {
        if (connection.messages.length < 2) return
        // Reply in reverse arrival order to prove id-based routing.
        const [a, b] = connection.messages.map((m) => JSON.parse(m))
        connection.send(
          JSON.stringify({ id: b.id, jsonrpc: '2.0', result: `r${b.id}` }),
        )
        connection.send(
          JSON.stringify({ id: a.id, jsonrpc: '2.0', result: `r${a.id}` }),
        )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const [r0, r1] = await Promise.all([
          client.request({ body: { method: 'eth_chainId' } }),
          client.request({ body: { method: 'eth_blockNumber' } }),
        ])
        expect(r0.result).toBe('r0')
        expect(r1.result).toBe('r1')
        client.close()
      } finally {
        await server.close()
      }
    })

    test('ignores responses with an unknown id', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        connection.send(
          JSON.stringify({ id: 999, jsonrpc: '2.0', result: 'wrong' }),
        )
        connection.send(
          JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
        )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const response = await client.request({
          body: { method: 'eth_chainId' },
        })
        expect(response.result).toBe('0x1')
        expect(client.requests.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('ignores a duplicate late response', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        const response = JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          result: '0x1',
        })
        connection.send(response)
        connection.send(response)
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const response = await client.request({
          body: { method: 'eth_chainId' },
        })
        expect(response.result).toBe('0x1')
        await wait(20)
        expect(client.requests.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('returns a raw JSON-RPC error without throwing', async () => {
      const client = await RpcClient.webSocket(ws, { keepAlive: false })
      const response = await client.request({
        body: { method: 'eth_thisDoesNotExist' },
      })
      expect(typeof response.error?.code).toBe('number')
      client.close()
    })

    test('rejects all pending requests when the socket closes', async () => {
      const server = await Ws.createServer(() => {})
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
          reconnect: false,
        })
        // No request timeout: a finite timeout races the close notification
        // under load and settles the request with the wrong error.
        const a = client
          .request({ body: { method: 'eth_chainId' }, timeout: 0 })
          .catch((error) => error)
        const b = client
          .request({ body: { method: 'eth_blockNumber' }, timeout: 0 })
          .catch((error) => error)
        await wait(20)
        server.dropAll()
        expect(await a).toBeInstanceOf(RpcClient.SocketClosedError)
        expect(await b).toBeInstanceOf(RpcClient.SocketClosedError)
        expect(client.requests.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('times out and removes the pending request', async () => {
      const server = await Ws.createServer(() => {})
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const error = await client
          .request({ body: { method: 'eth_chainId' }, timeout: 50 })
          .catch((error) => error)
        expect(error).toBeInstanceOf(RpcClient.TimeoutError)
        expect(client.requests.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('ignores a response that arrives after a timeout', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        setTimeout(
          () =>
            connection.send(
              JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
            ),
          100,
        )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const error = await client
          .request({ body: { method: 'eth_chainId' }, timeout: 30 })
          .catch((error) => error)
        expect(error).toBeInstanceOf(RpcClient.TimeoutError)
        // Let the late response for the timed-out request arrive + be ignored.
        await wait(120)
        const response = await client.request({
          body: { method: 'eth_chainId' },
          timeout: 1_000,
        })
        expect(response.result).toBe('0x1')
        expect(client.requests.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('replays a retained parse error to subsequent requests', async () => {
      const server = await Ws.createServer((connection) => {
        connection.send('not json')
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const first = await client
          .request({ body: { method: 'eth_chainId' }, timeout: 50 })
          .catch((error) => error)
        expect(first).toBeInstanceOf(RpcClient.TimeoutError)
        // The retained parse error rejects the next request immediately.
        const second = await client
          .request({ body: { method: 'eth_chainId' }, timeout: 1_000 })
          .catch((error) => error)
        expect(second).toBeInstanceOf(Error)
        expect(second).not.toBeInstanceOf(RpcClient.TimeoutError)
        client.close()
      } finally {
        await server.close()
      }
    })
  })

  describe('batch', () => {
    test('an empty batch resolves to [] without sending a frame', async () => {
      const server = await Ws.createServer(() => {})
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        await wait(20)
        const responses = await client.request({ body: [] })
        expect(responses).toEqual([])
        expect(server.connections[0]!.messages.length).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('sends one frame per item with sequential ids', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        connection.send(
          JSON.stringify({
            id: request.id,
            jsonrpc: '2.0',
            result: `r${request.id}`,
          }),
        )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        await client.request({
          body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
        })
        const ids = server.connections[0]!.messages.map((m) => JSON.parse(m).id)
        expect(ids).toEqual([0, 1])
        client.close()
      } finally {
        await server.close()
      }
    })

    test('preserves input order under reversed responses', async () => {
      const server = await Ws.createServer((connection) => {
        if (connection.messages.length < 2) return
        const [a, b] = connection.messages.map((m) => JSON.parse(m))
        connection.send(
          JSON.stringify({ id: b.id, jsonrpc: '2.0', result: `r${b.id}` }),
        )
        connection.send(
          JSON.stringify({ id: a.id, jsonrpc: '2.0', result: `r${a.id}` }),
        )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const [a, b] = await client.request({
          body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
        })
        expect(a.result).toBe('r0')
        expect(b.result).toBe('r1')
        client.close()
      } finally {
        await server.close()
      }
    })

    test('returns mixed success and error envelopes', async () => {
      const client = await RpcClient.webSocket(ws, { keepAlive: false })
      const [a, b] = await client.request({
        body: [{ method: 'eth_chainId' }, { method: 'eth_thisDoesNotExist' }],
      })
      expect(a.result).toBe('0x1')
      expect(typeof b.error?.code).toBe('number')
      client.close()
    })

    test('rejects and cleans up when one item times out', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_chainId')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
          )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const error = await client
          .request({
            body: [{ method: 'eth_chainId' }, { method: 'eth_slow' }],
            timeout: 50,
          })
          .catch((error) => error)
        expect(error).toBeInstanceOf(RpcClient.TimeoutError)
        await wait(20)
        expect(client.requests.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })
  })

  describe('subscribe', () => {
    test('registers the subscription after the ack', async () => {
      const client = await RpcClient.webSocket(ws, { keepAlive: false })
      const sub = await client.subscribe({
        params: ['newHeads'],
      })
      expect(sub.subscriptionId).toMatch(/^0x/)
      expect(client.subscriptions.size).toBe(1)
      expect(client.subscriptions.has(sub.subscriptionId)).toBe(true)
      await sub.unsubscribe()
      client.close()
    })

    test('receives notifications and unsubscribes', async () => {
      const rpcClient = await RpcClient.webSocket(ws, { keepAlive: false })
      const data: unknown[] = []
      const sub = await rpcClient.subscribe({
        params: ['newHeads'],
      })
      sub.onData((d) => data.push(d))
      // anvil only emits `newHeads` when a block is mined.
      await Actions.block.mine(client, { blocks: 1 })
      await wait(500)
      expect(data.length).toBeGreaterThan(0)
      expect((data[0] as { subscription: string }).subscription).toBe(
        sub.subscriptionId,
      )
      const result = await sub.unsubscribe()
      expect(result.result).toBe(true)
      rpcClient.close()
    })

    test('routes interleaved notifications to the matching subscription', async () => {
      let count = 0
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          count++
          connection.send(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              result: `0xsub${count}`,
            }),
          )
        }
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const a: unknown[] = []
        const b: unknown[] = []
        const subA = await client.subscribe({
          params: ['newHeads'],
        })
        subA.onData((d) => a.push(d))
        const subB = await client.subscribe({
          params: ['newHeads'],
        })
        subB.onData((d) => b.push(d))
        const notify = (subscription: string, result: unknown) =>
          server.connections[0]!.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: { subscription, result },
            }),
          )
        notify('0xsub1', 1)
        notify('0xsub2', 2)
        notify('0xsub1', 3)
        await wait(50)
        expect(a).toEqual([
          { subscription: '0xsub1', result: 1 },
          { subscription: '0xsub1', result: 3 },
        ])
        expect(b).toEqual([{ subscription: '0xsub2', result: 2 }])
        client.close()
      } finally {
        await server.close()
      }
    })

    test('ignores notifications for unknown subscriptions', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const data: unknown[] = []
        const sub = await client.subscribe({
          params: ['newHeads'],
        })
        sub.onData((d) => data.push(d))
        server.connections[0]!.send(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_subscription',
            params: { subscription: '0xunknown', result: 1 },
          }),
        )
        await wait(30)
        expect(data).toEqual([])
        client.close()
      } finally {
        await server.close()
      }
    })

    test('notifies an active subscription on close', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
          reconnect: false,
        })
        let errored: unknown
        const sub = await client.subscribe({
          params: ['newHeads'],
        })
        sub.onError((error) => {
          errored = error
        })
        server.dropAll()
        await wait(50)
        expect(errored).toBeInstanceOf(RpcClient.SocketClosedError)
        expect(client.subscriptions.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('flushes buffered errors to a late onError listener', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
          reconnect: false,
        })
        const sub = await client.subscribe({ params: ['newHeads'] })
        // The socket closes before any `onError` listener is attached, so the
        // error is buffered.
        server.dropAll()
        await wait(50)
        // Attaching the listener flushes the buffered error.
        const errors: unknown[] = []
        sub.onError((error) => errors.push(error))
        expect(errors).toHaveLength(1)
        expect(errors[0]).toBeInstanceOf(RpcClient.SocketClosedError)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('resubscribes all active subscriptions after a reconnect', async () => {
      let count = 0
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          count++
          connection.send(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              result: `0xsub${count}`,
            }),
          )
        }
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
          reconnect: { minReconnectionDelay: 10, maxReconnectionDelay: 10 },
        })
        await client.subscribe({ params: ['newHeads'] })
        await client.subscribe({ params: ['newHeads'] })
        expect(count).toBe(2)
        server.dropAll()
        await wait(500)
        expect(count).toBe(4)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('routes data to the new subscription id after a reconnect', async () => {
      let count = 0
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          count++
          connection.send(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              result: `0xsub${count}`,
            }),
          )
        }
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
          reconnect: { minReconnectionDelay: 10, maxReconnectionDelay: 10 },
        })
        const data: unknown[] = []
        const sub = await client.subscribe({
          params: ['newHeads'],
        })
        sub.onData((d) => data.push(d))
        server.dropAll()
        await wait(300)
        expect(count).toBe(2)
        const notify = (subscription: string) =>
          server.connections.at(-1)?.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_subscription',
              params: { subscription, result: 1 },
            }),
          )
        // The old id is gone; only the new id reaches `onData`.
        notify('0xsub1')
        notify('0xsub2')
        await wait(50)
        expect(data).toEqual([{ subscription: '0xsub2', result: 1 }])
        client.close()
      } finally {
        await server.close()
      }
    })

    test('unsubscribe removes the entry before the ack and ignores later notifications', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0xsub' }),
          )
        if (request.method === 'eth_unsubscribe')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: true }),
          )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const data: unknown[] = []
        const sub = await client.subscribe({
          params: ['newHeads'],
        })
        sub.onData((d) => data.push(d))
        const unsubscribed = sub.unsubscribe()
        // The local entry is removed synchronously, before the ack.
        expect(client.subscriptions.has('0xsub')).toBe(false)
        const response = await unsubscribed
        expect(response.result).toBe(true)
        server.connections[0]!.send(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_subscription',
            params: { subscription: '0xsub', result: 1 },
          }),
        )
        await wait(30)
        expect(data).toEqual([])
        client.close()
      } finally {
        await server.close()
      }
    })

    test('does not resubscribe an unsubscribed subscription after a reconnect', async () => {
      let count = 0
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe') {
          count++
          connection.send(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              result: `0xsub${count}`,
            }),
          )
        }
        if (request.method === 'eth_unsubscribe')
          connection.send(
            JSON.stringify({ id: request.id, jsonrpc: '2.0', result: true }),
          )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
          reconnect: { minReconnectionDelay: 10, maxReconnectionDelay: 10 },
        })
        const sub = await client.subscribe({
          params: ['newHeads'],
        })
        await sub.unsubscribe()
        server.dropAll()
        await wait(300)
        expect(count).toBe(1)
        client.close()
      } finally {
        await server.close()
      }
    })

    test('rejects subscribe on a JSON-RPC error', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method === 'eth_subscribe')
          connection.send(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              error: { code: -32602, message: 'invalid params' },
            }),
          )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        await expect(
          client.subscribe({
            params: ['newHeads'],
          }),
        ).rejects.toBeDefined()
        expect(client.subscriptions.size).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })
  })

  describe('keep-alive', () => {
    test('sends the exact keep-alive payload', async () => {
      const server = await Ws.createServer(() => {})
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: { interval: 20 },
        })
        await wait(60)
        const ping = server.connections[0]!.messages
          .map((m) => JSON.parse(m))
          .find((m) => m.method === 'net_version')
        expect(ping).toEqual({
          jsonrpc: '2.0',
          id: null,
          method: 'net_version',
          params: [],
        })
        client.close()
      } finally {
        await server.close()
      }
    })

    test('ignores keep-alive (id: null) responses while a request is pending', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        if (request.method !== 'eth_chainId') return
        // A keep-alive style response must not resolve the pending request.
        connection.send(
          JSON.stringify({ id: null, jsonrpc: '2.0', result: '1' }),
        )
        setTimeout(
          () =>
            connection.send(
              JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
            ),
          20,
        )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const response = await client.request({
          body: { method: 'eth_chainId' },
        })
        expect(response.result).toBe('0x1')
        client.close()
      } finally {
        await server.close()
      }
    })

    test('stops sending keep-alive messages after close', async () => {
      let pings = 0
      const server = await Ws.createServer((_connection, message) => {
        if (JSON.parse(message).method === 'net_version') pings++
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: { interval: 20 },
        })
        await wait(50)
        const before = pings
        expect(before).toBeGreaterThan(0)
        client.close()
        await wait(60)
        expect(pings).toBe(before)
      } finally {
        await server.close()
      }
    })

    test('does not send keep-alive messages when disabled', async () => {
      let pings = 0
      const server = await Ws.createServer((_connection, message) => {
        if (JSON.parse(message).method === 'net_version') pings++
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        await wait(60)
        expect(pings).toBe(0)
        client.close()
      } finally {
        await server.close()
      }
    })
  })

  describe('frames', () => {
    test('ignores whitespace-only frames', async () => {
      const server = await Ws.createServer((connection, message) => {
        const request = JSON.parse(message)
        connection.send('   ')
        connection.send(
          JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
        )
      })
      try {
        const client = await RpcClient.webSocket(server.url, {
          keepAlive: false,
        })
        const response = await client.request({
          body: { method: 'eth_chainId' },
        })
        expect(response.result).toBe('0x1')
        client.close()
      } finally {
        await server.close()
      }
    })
  })
})
