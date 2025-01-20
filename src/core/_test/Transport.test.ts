import { setTimeout } from 'node:timers/promises'
import { Provider, RpcResponse } from 'ox'
import { Transport } from 'viem'
import { describe, expect, test } from 'vitest'

import type { IncomingHttpHeaders } from 'node:http'
import * as Anvil from '../../../test/src/anvil.js'
import * as Http from '../../../test/src/http.js'
import * as Errors from '../Errors.js'

describe('from', () => {
  test('default', async () => {
    const args: string[] = []
    const server = await Http.createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        args.push(body)
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ result: body }))
      })
    })

    const transport = Transport.http(server.url).setup()

    const results = await Promise.all([
      transport.request({ method: 'eth_a' }),
      transport.request({ method: 'eth_b' }),
      transport.request({ method: 'eth_a', params: [1] }),
      transport.request({ method: 'eth_c' }),
      transport.request({ method: 'eth_d' }),
      transport.request({ method: 'eth_a', params: [2] }),
      transport.request({ method: 'eth_a' }),
      transport.request({ method: 'eth_a' }),
    ])

    expect(
      args
        .map((arg) => JSON.parse(arg))
        .sort((a, b) => a.id - b.id)
        .map((arg) => JSON.stringify(arg)),
    ).toMatchInlineSnapshot(`
      [
        "{"id":0,"method":"eth_a","jsonrpc":"2.0"}",
        "{"id":1,"method":"eth_b","jsonrpc":"2.0"}",
        "{"id":2,"method":"eth_a","params":[1],"jsonrpc":"2.0"}",
        "{"id":3,"method":"eth_c","jsonrpc":"2.0"}",
        "{"id":4,"method":"eth_d","jsonrpc":"2.0"}",
        "{"id":5,"method":"eth_a","params":[2],"jsonrpc":"2.0"}",
        "{"id":6,"method":"eth_a","jsonrpc":"2.0"}",
        "{"id":7,"method":"eth_a","jsonrpc":"2.0"}",
      ]
    `)
    expect(results).toMatchInlineSnapshot(`
      [
        "{"id":0,"method":"eth_a","jsonrpc":"2.0"}",
        "{"id":1,"method":"eth_b","jsonrpc":"2.0"}",
        "{"id":2,"method":"eth_a","params":[1],"jsonrpc":"2.0"}",
        "{"id":3,"method":"eth_c","jsonrpc":"2.0"}",
        "{"id":4,"method":"eth_d","jsonrpc":"2.0"}",
        "{"id":5,"method":"eth_a","params":[2],"jsonrpc":"2.0"}",
        "{"id":6,"method":"eth_a","jsonrpc":"2.0"}",
        "{"id":7,"method":"eth_a","jsonrpc":"2.0"}",
      ]
    `)
  })

  test('options: retryCount', async () => {
    let retryCount = -1
    const server = await Http.createServer((_req, res) => {
      retryCount++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: { code: RpcResponse.InternalError.code, message: 'message' },
        }),
      )
    })

    const transport1 = Transport.http(server.url).setup()
    await expect(() =>
      transport1.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()
    expect(retryCount).toBe(3)

    retryCount = -1
    const transport2 = Transport.http(server.url, {
      retryCount: 1,
    }).setup()

    await expect(() =>
      transport2.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowError()
    expect(retryCount).toBe(1)

    retryCount = -1
    const transport3 = Transport.http(server.url).setup()

    await expect(() =>
      transport3.request({ method: 'eth_blockNumber' }, { retryCount: 2 }),
    ).rejects.toThrowError()
    expect(retryCount).toBe(2)
  })

  test('options: retryDelay', async () => {
    const start = Date.now()
    let end = 0

    const server = await Http.createServer((_req, res) => {
      end = Date.now() - start
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: { code: RpcResponse.InternalError.code, message: 'message' },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request(
        { method: 'eth_blockNumber' },
        { retryDelay: 1000, retryCount: 1 },
      ),
    ).rejects.toThrowError()
    expect(end > 1000 && end < 1020).toBeTruthy()
  })

  test('behavior: throws BaseError', async () => {
    const transport = Transport.from({
      setup() {
        return {
          request: () =>
            Promise.reject(new Errors.BaseError('foo', { details: 'bar' })),
          type: 'http',
        }
      },
    }).setup()
    await expect(() =>
      transport.request({ method: 'eth_test' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: foo

      Request: {"method":"eth_test"}

      Details: bar
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws ParseError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: { code: RpcResponse.ParseError.code, message: 'message' },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws InvalidRequestError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.InvalidRequestError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws MethodNotFoundError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.MethodNotFoundError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws InvalidParamsError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.InvalidParamsError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws InternalError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.InternalError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws InvalidInputError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.InvalidInputError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws ResourceNotFoundError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.ResourceNotFoundError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws ResourceUnavailableError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.ResourceUnavailableError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws TransactionRejectedError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.TransactionRejectedError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws MethodNotSupportedError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.MethodNotSupportedError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws LimitExceededError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.LimitExceededError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws VersionNotSupportedError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: RpcResponse.VersionNotSupportedError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws UserRejectedRequestError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: Provider.UserRejectedRequestError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws UserRejectedRequestError (CAIP-25)', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: 5000,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws UnauthorizedProviderError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: Provider.UnauthorizedError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws UnsupportedMethodError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: Provider.UnsupportedMethodError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws DisconnectedError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: Provider.DisconnectedError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: throws ChainDisconnectedError', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          error: {
            code: Provider.ChainDisconnectedError.code,
            message: 'message',
          },
        }),
      )
    })

    const transport = Transport.http(server.url).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: message

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: message
      Version: viem@x.y.z]
    `)
  })

  test('behavior: dedupes requests', async () => {
    const args: string[] = []
    const server = await Http.createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        args.push(body)
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ result: body }))
      })
    })

    const transport = Transport.http(server.url).setup()

    const results = await Promise.all([
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (different params).
      transport.request(
        // @ts-expect-error
        { method: 'eth_blockNumber', params: [1] },
        { dedupe: true },
      ),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (different method).
      transport.request({ method: 'eth_chainId' }, { dedupe: true }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (dedupe: undefined).
      transport.request({ method: 'eth_blockNumber' }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
    ])

    expect(
      args
        .map((arg) => JSON.parse(arg))
        .sort((a, b) => a.id - b.id)
        .map((arg) => JSON.stringify(arg)),
    ).toMatchInlineSnapshot(`
      [
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":1,"method":"eth_blockNumber","params":[1],"jsonrpc":"2.0"}",
        "{"id":2,"method":"eth_chainId","jsonrpc":"2.0"}",
        "{"id":3,"method":"eth_blockNumber","jsonrpc":"2.0"}",
      ]
    `)
    expect(results).toMatchInlineSnapshot(`
      [
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":1,"method":"eth_blockNumber","params":[1],"jsonrpc":"2.0"}",
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":2,"method":"eth_chainId","jsonrpc":"2.0"}",
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":3,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
      ]
    `)
  })

  describe('behavior: retry', () => {
    test('non-deterministic InternalRpcError', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(
          JSON.stringify({
            error: { code: RpcResponse.InternalError.code, message: 'message' },
          }),
        )
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowError()
      expect(retryCount).toBe(3)
    })

    test('non-deterministic LimitExceededRpcError', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(
          JSON.stringify({
            error: {
              code: RpcResponse.LimitExceededError.code,
              message: 'message',
            },
          }),
        )
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowError()
      expect(retryCount).toBe(3)
    })

    test('non-deterministic UnknownRpcError', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_test' }),
      ).rejects.toThrowError()
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (500)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Internal Server Error
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (500 w/ Retry-After header)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Retry-After': 1,
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Internal Server Error
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (403)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(403, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Forbidden
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (408)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(408, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Request Timeout
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (413)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(413, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Payload Too Large
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (429)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(429, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Too Many Requests
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (500)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Internal Server Error
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (502)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(502, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Bad Gateway
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (503)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(503, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Service Unavailable
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('non-deterministic HttpError (504)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(504, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Transport.RequestError: HTTP request failed.

        URL: https://viem.sh/rpc
        Request: {"method":"eth_blockNumber"}

        Details: Gateway Timeout
        Version: viem@x.y.z]
      `)
      expect(retryCount).toBe(3)
    })

    test('deterministic HttpError (401)', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(401, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({}))
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowError()
      expect(retryCount).toBe(0)
    })

    test('deterministic RpcError', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(
          JSON.stringify({
            error: {
              code: RpcResponse.InvalidParamsError.code,
              message: 'message',
            },
          }),
        )
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowError()
      expect(retryCount).toBe(0)
    })

    test('deterministic UserRejectedRequestError', async () => {
      let retryCount = -1
      const server = await Http.createServer((_req, res) => {
        retryCount++
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(
          JSON.stringify({
            error: {
              code: Provider.UserRejectedRequestError.code,
              message: 'message',
            },
          }),
        )
      })

      const transport = Transport.http(server.url).setup()

      await expect(() =>
        transport.request({ method: 'eth_blockNumber' }),
      ).rejects.toThrowError()
      expect(retryCount).toBe(0)
    })
  })
})

describe('http', () => {
  test('default', () => {
    const transport = Transport.http('https://viem.sh/rpc')

    expect(transport.setup()).toMatchInlineSnapshot(`
      {
        "request": [Function],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": 10000,
        "type": "http",
        "url": "https://viem.sh/rpc",
      }
    `)
  })

  test('behavior: request', async () => {
    const transport = Transport.http(Anvil.mainnet.config.forkUrl).setup()
    const blockNumber = await transport.request({ method: 'eth_blockNumber' })
    expect(blockNumber).toBeDefined()
  })

  test('behavior: batch', async () => {
    let count = 0
    const server = await Http.createServer((_, res) => {
      count++
      res.appendHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify([
          { result: '0x1' },
          { result: '0x2' },
          { result: '0x3' },
        ]),
      )
    })

    const transport = Transport.http(server.url, {
      batch: true,
    }).setup()

    const p = []
    p.push(transport.request({ method: 'eth_a' }))
    p.push(transport.request({ method: 'eth_b' }, { dedupe: true }))
    p.push(transport.request({ method: 'eth_c' }))
    // test dedupe
    p.push(transport.request({ method: 'eth_b' }, { dedupe: true }))
    await setTimeout(1)
    p.push(transport.request({ method: 'eth_d' }, { dedupe: true }))
    p.push(transport.request({ method: 'eth_e' }))
    // test dedupe
    p.push(transport.request({ method: 'eth_d' }, { dedupe: true }))

    const results = await Promise.all(p)

    expect(results).toMatchInlineSnapshot(`
      [
        "0x1",
        "0x2",
        "0x3",
        "0x2",
        "0x1",
        "0x2",
        "0x1",
      ]
    `)
    expect(count).toEqual(2)

    await server.close()
  })

  test('behavior: batch (with wait)', async () => {
    let count = 0
    const server = await Http.createServer((_, res) => {
      count++
      res.appendHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify([
          { result: '0x1' },
          { result: '0x2' },
          { result: '0x3' },
          { result: '0x4' },
          { result: '0x5' },
        ]),
      )
    })

    const transport = Transport.http(server.url, {
      batch: { wait: 16 },
    }).setup()

    const p = []
    p.push(transport.request({ method: 'eth_a' }))
    p.push(transport.request({ method: 'eth_b' }, { dedupe: true }))
    p.push(transport.request({ method: 'eth_c' }))
    // test dedupe
    p.push(transport.request({ method: 'eth_b' }, { dedupe: true }))
    await setTimeout(1)
    p.push(transport.request({ method: 'eth_d' }))
    p.push(transport.request({ method: 'eth_e' }))
    await setTimeout(20)
    p.push(transport.request({ method: 'eth_f' }, { dedupe: true }))
    p.push(transport.request({ method: 'eth_g' }))
    // test dedupe
    p.push(transport.request({ method: 'eth_f' }, { dedupe: true }))

    const results = await Promise.all(p)

    expect(results).toMatchInlineSnapshot(`
      [
        "0x1",
        "0x2",
        "0x3",
        "0x2",
        "0x4",
        "0x5",
        "0x1",
        "0x2",
        "0x1",
      ]
    `)
    expect(count).toEqual(2)

    await server.close()
  })

  test('behavior: dedupe', async () => {
    const args: string[] = []
    const server = await Http.createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        args.push(body)
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ result: body }))
      })
    })

    const transport = Transport.http(server.url).setup()

    const results = await Promise.all([
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (different params).
      transport.request(
        // @ts-expect-error
        { method: 'eth_blockNumber', params: [1] },
        { dedupe: true },
      ),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (different method).
      transport.request({ method: 'eth_chainId' }, { dedupe: true }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
      // this will not be deduped (dedupe: undefined).
      transport.request({ method: 'eth_blockNumber' }),
      transport.request({ method: 'eth_blockNumber' }, { dedupe: true }),
    ])

    expect(
      args
        .map((arg) => JSON.parse(arg))
        .sort((a, b) => a.id - b.id)
        .map((arg) => JSON.stringify(arg)),
    ).toMatchInlineSnapshot(`
      [
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":1,"method":"eth_blockNumber","params":[1],"jsonrpc":"2.0"}",
        "{"id":2,"method":"eth_chainId","jsonrpc":"2.0"}",
        "{"id":3,"method":"eth_blockNumber","jsonrpc":"2.0"}",
      ]
    `)
    expect(results).toMatchInlineSnapshot(`
      [
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":1,"method":"eth_blockNumber","params":[1],"jsonrpc":"2.0"}",
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":2,"method":"eth_chainId","jsonrpc":"2.0"}",
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":3,"method":"eth_blockNumber","jsonrpc":"2.0"}",
        "{"id":0,"method":"eth_blockNumber","jsonrpc":"2.0"}",
      ]
    `)
  })

  test('behavior: fetchOptions', async () => {
    let headers: IncomingHttpHeaders = {}
    const server = await Http.createServer((req, res) => {
      headers = req.headers
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const transport = Transport.http(server.url, {
      fetchOptions: {
        headers: { 'x-wagmi': 'gm' },
        cache: 'force-cache',
        method: 'PATCH',
        signal: null,
      },
    }).setup()

    await transport.request({ method: 'eth_blockNumber' })
    expect(headers['x-wagmi']).toBeDefined()

    await server.close()
  })

  test('behavior: onFetchRequest', async () => {
    const server = await Http.createServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const requests: Request[] = []
    const transport = Transport.http(server.url, {
      onFetchRequest(request) {
        requests.push(request)
      },
    }).setup()

    await transport.request({ method: 'eth_blockNumber' })

    expect(requests.length).toBe(1)

    await server.close()
  })

  test('behavior: onFetchResponse', async () => {
    const server = await Http.createServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const responses: Response[] = []
    const transport = Transport.http(server.url, {
      onFetchResponse(response) {
        responses.push(response)
      },
    }).setup()

    await transport.request({ method: 'eth_blockNumber' })

    expect(responses.length).toBe(1)

    await server.close()
  })

  test('behavior: retryCount', async () => {
    let retryCount = -1
    const server = await Http.createServer((_req, res) => {
      retryCount++
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({}))
    })

    const transport = Transport.http(server.url, {
      retryCount: 1,
    }).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: HTTP request failed.

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: Internal Server Error
      Version: viem@x.y.z]
    `)
    expect(retryCount).toBe(1)
  })

  test('behavior: retryCount', async () => {
    const start = Date.now()
    let end = 0
    const server = await Http.createServer((_req, res) => {
      end = Date.now() - start
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({}))
    })

    const transport = Transport.http(server.url, {
      retryCount: 1,
      retryDelay: 500,
    }).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: HTTP request failed.

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: Internal Server Error
      Version: viem@x.y.z]
    `)
    expect(end > 500 && end < 520).toBeTruthy()
  })

  test('behavior: timeout', async () => {
    const server = await Http.createServer(async (_req, res) => {
      await setTimeout(5000)
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({}))
    })

    const transport = Transport.http(server.url, {
      timeout: 100,
    }).setup()

    await expect(() =>
      transport.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transport.RequestError: Operation timed out.

      URL: https://viem.sh/rpc
      Request: {"method":"eth_blockNumber"}

      Details: Operation timed out.
      Version: viem@x.y.z]
    `)
  })

  test('errors: rpc error', async () => {
    const transport = Transport.http(Anvil.mainnet.config.forkUrl).setup()

    await expect(() =>
      transport.request({ method: 'eth_wagmi' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [Transport.RequestError: the method eth_wagmi does not exist/is not available

      URL: https://viem.sh/rpc
      Request: {"method":"eth_wagmi"}

      Details: the method eth_wagmi does not exist/is not available
      Version: viem@x.y.z]
    `,
    )
  })
})
