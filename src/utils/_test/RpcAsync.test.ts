import type { IncomingHttpHeaders } from 'node:http'
import { describe, expect, test, vi } from 'vitest'

import { Hash, Hex } from 'ox'
import * as Anvil from '../../../test/src/anvil.js'
import * as Http from '../../../test/src/http.js'
import * as withTimeout from '../../core/internal/promise.js'
import * as RpcAsync from '../RpcAsync.js'

describe('from', () => {
  test('default', async () => {
    const transport = RpcAsync.from({
      async request() {
        return {
          id: 0,
          jsonrpc: '2.0',
          result: ['0x0000000000000000000000000000000000000000'],
        }
      },
    })
    const accounts = await transport.request({ method: 'eth_accounts' })
    expect(accounts).toMatchInlineSnapshot(`
      {
        "id": 0,
        "jsonrpc": "2.0",
        "result": [
          "0x0000000000000000000000000000000000000000",
        ],
      }
    `)
  })

  test('behavior: options (request)', async () => {
    let options: Record<string, unknown> = {}
    const transport = RpcAsync.from({
      async request(_body, options_) {
        options = options_
        return {
          id: 0,
          jsonrpc: '2.0',
          result: ['0x0000000000000000000000000000000000000000'],
        }
      },
    })
    await transport.request({ method: 'eth_accounts' }, { foo: 'bar' })
    expect(options).toMatchInlineSnapshot(`
      {
        "foo": "bar",
      }
    `)
  })

  test('behavior: options (RpcAsync.from)', async () => {
    let options: Record<string, unknown> = {}
    const transport = RpcAsync.from(
      {
        async request(_body, options_) {
          options = options_
          return {
            id: 0,
            jsonrpc: '2.0',
            result: ['0x0000000000000000000000000000000000000000'],
          }
        },
      },
      { foo: 'baz' },
    )
    await transport.request({ method: 'eth_accounts' })
    expect(options).toMatchInlineSnapshot(`
      {
        "foo": "baz",
      }
    `)
  })
})

describe('fromHttp', () => {
  test('default', async () => {
    const rpc = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)
    expect(
      await Promise.all([
        rpc.request({ method: 'web3_clientVersion' }),
        rpc.request({ method: 'web3_clientVersion' }),
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "id": 0,
          "jsonrpc": "2.0",
          "result": "anvil/v0.3.0",
        },
        {
          "id": 1,
          "jsonrpc": "2.0",
          "result": "anvil/v0.3.0",
        },
      ]
    `)
  })

  test('behavior: zero timeout', async () => {
    const rpc = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)
    await expect(
      rpc.request({
        method: 'eth_getBlockByHash',
        params: ['0x0', false],
      }),
    ).resolves.toMatchInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "odd number of digits",
        },
        "id": 0,
        "jsonrpc": "2.0",
      }
    `,
    )
  })

  test('behavior: invalid rpc params', async () => {
    const rpc = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)
    await expect(
      rpc.request({
        method: 'eth_getBlockByHash',
        params: ['0x0', false],
      }),
    ).resolves.toMatchInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "odd number of digits",
        },
        "id": 0,
        "jsonrpc": "2.0",
      }
    `,
    )
  })

  test('behavior: invalid request', async () => {
    const rpc = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)
    await expect(
      rpc.request({
        method: 'eth_wagmi',
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "error": {
          "code": -32601,
          "message": "Method not found",
        },
        "id": 0,
        "jsonrpc": "2.0",
      }
    `)
  })

  test('behavior: serial requests', async () => {
    const rpc = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)
    const response: any = []
    for (const i in Array.from({ length: 10 })) {
      response.push(
        await rpc.request({
          method: 'eth_getBlockByNumber',
          params: [
            Hex.fromNumber(Anvil.mainnet.config.forkBlockNumber - BigInt(i)),
            false,
          ],
        }),
      )
    }
    expect(response.map((r: any) => r.result.number)).toEqual(
      Array.from({ length: 10 }).map((_, i) =>
        Hex.fromNumber(Anvil.mainnet.config.forkBlockNumber - BigInt(i)),
      ),
    )
  })

  test('behavior: parallel requests', async () => {
    const rpcClient = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)

    const response = await Promise.all(
      Array.from({ length: 50 }).map(async (_, i) => {
        return await rpcClient.request({
          method: 'eth_getBlockByNumber',
          params: [
            Hex.fromNumber(Anvil.mainnet.config.forkBlockNumber - BigInt(i)),
            false,
          ],
        })
      }),
    )
    expect(response.map((r) => r.result?.number)).toEqual(
      Array.from({ length: 50 }).map((_, i) =>
        Hex.fromNumber(Anvil.mainnet.config.forkBlockNumber - BigInt(i)),
      ),
    )
  })

  test('behavior: no application/json header', async () => {
    const server = await Http.createServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })
    const rpc = RpcAsync.fromHttp(server.url)
    expect(
      await rpc.request({ method: 'web3_clientVersion' }),
    ).toMatchInlineSnapshot(`
      {
        "result": "0x1",
      }
    `)
    await server.close()

    const server2 = await Http.createServer((_, res) => {
      res.end('bogus')
    })
    const rpc2 = RpcAsync.fromHttp(server2.url)
    await expect(() =>
      rpc2.request({ method: 'web3_clientVersion' }),
    ).rejects.toMatchInlineSnapshot(`
      [RpcAsync.HttpError: HTTP Response could not be parsed as JSON.

      URL: https://viem.sh/rpc
      Body: {"id":0,"method":"web3_clientVersion","jsonrpc":"2.0"}

      Details: HTTP Response could not be parsed as JSON.
      Version: viem@x.y.z]
    `)
    await server2.close()
  })

  test('options: `fetchOptions`', async () => {
    let headers: IncomingHttpHeaders = {}
    const server = await Http.createServer((req, res) => {
      headers = req.headers
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const rpc = RpcAsync.fromHttp(server.url)

    expect(
      await rpc.request(
        {
          method: 'web3_clientVersion',
        },
        {
          fetchOptions: {
            headers: { 'x-wagmi': 'gm' },
            cache: 'force-cache',
            method: 'PATCH',
            signal: null,
          },
        },
      ),
    ).toBeDefined()
    expect(headers['x-wagmi']).toBeDefined()

    await server.close()
  })

  test('options: `fetchOptions.signal`', async () => {
    const server = await Http.createServer(() => {})

    const rpc = RpcAsync.fromHttp(server.url)

    const controller = new AbortController()

    await expect(() =>
      Promise.all([
        rpc.request(
          {
            method: 'web3_clientVersion',
          },
          {
            fetchOptions: {
              signal: controller.signal,
            },
          },
        ),
        Promise.resolve(controller.abort()),
      ]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [RpcAsync.HttpError: Operation timed out.

      URL: https://viem.sh/rpc
      Body: {"id":0,"method":"web3_clientVersion","jsonrpc":"2.0"}

      Details: Operation timed out.
      Version: viem@x.y.z]
    `)
  })

  test('options: `fetchOptions` (fn)', async () => {
    let headers: IncomingHttpHeaders = {}
    const server = await Http.createServer((req, res) => {
      headers = req.headers
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const rpc = RpcAsync.fromHttp(server.url)

    expect(
      await rpc.request(
        {
          method: 'web3_clientVersion',
        },
        {
          fetchOptions(body) {
            return {
              headers: { 'x-method': (body as any).method },
              cache: 'force-cache',
              method: 'PATCH',
              signal: null,
            }
          },
        },
      ),
    ).toBeDefined()
    expect(headers['x-method']).toBe('web3_clientVersion')

    await server.close()
  })

  test('options: `onRequest`', async () => {
    const server = await Http.createServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const requests: Request[] = []
    const rpc = RpcAsync.fromHttp(server.url, {
      onRequest: (request) => {
        requests.push(request)
      },
    })
    await rpc.request({
      method: 'web3_clientVersion',
    })
    await rpc.request(
      {
        method: 'web3_clientVersion',
      },
      {
        onRequest: (request) => {
          requests.push(request)
        },
      },
    )

    expect(requests.length).toBe(2)

    await server.close()
  })

  test('behavior: `onRequest` can return an override request', async () => {
    let headers: IncomingHttpHeaders = {}
    const server = await Http.createServer((req, res) => {
      headers = req.headers
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const rpc = RpcAsync.fromHttp(server.url, {
      onRequest: async (request) => {
        // simulate a middleware that hashes the body - example might be authenticated service such
        // as flashbots RPC which requires an auth header that is a signature of the request body
        const newRequest = request.clone()
        const text = await request.text()
        newRequest.headers.set(
          'x-body-hash',
          Hash.keccak256(Hex.fromString(text)),
        )

        return newRequest
      },
    })
    await rpc.request({
      method: 'web3_clientVersion',
    })
    expect(headers['x-body-hash']).toBe(
      '0xcae4461b2aa5ab100851306bd2f94aa9561b7aee5eb9013e39a6f3dece571066',
    )
  })

  test('options: `onResponse`', async () => {
    const server = await Http.createServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const responses: Response[] = []
    const rpc = RpcAsync.fromHttp(server.url, {
      onResponse: (response) => {
        responses.push(response)
      },
    })
    await rpc.request({
      method: 'web3_clientVersion',
    })
    await rpc.request(
      {
        method: 'web3_clientVersion',
      },
      {
        onResponse: (response) => {
          responses.push(response)
        },
      },
    )

    expect(responses.length).toBe(2)

    await server.close()
  })

  test('behavior: http error', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: 'ngmi' }))
    })

    const rpc = RpcAsync.fromHttp(server.url)

    await expect(() =>
      rpc.request({
        method: 'eth_getBlockByNumber',
        params: [Hex.fromNumber(Anvil.mainnet.config.forkBlockNumber), false],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [RpcAsync.HttpError: HTTP request failed.

      Status: 500
      URL: https://viem.sh/rpc
      Body: {"id":0,"method":"eth_getBlockByNumber","params":["0x149adc6",false],"jsonrpc":"2.0"}

      Details: "ngmi"
      Version: viem@x.y.z]
    `)
  })

  test('behavior: fetch error', async () => {
    vi.stubGlobal('fetch', () => {
      throw new Error('foo', { cause: new Error('bar') })
    })

    const rpc = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)

    await expect(() =>
      rpc.request({
        method: 'eth_getBlockByNumber',
        params: [Hex.fromNumber(Anvil.mainnet.config.forkBlockNumber), false],
      }),
    ).rejects.toMatchInlineSnapshot(`
      [RpcAsync.HttpError: foo

      URL: https://viem.sh/rpc
      Body: {"id":0,"method":"eth_getBlockByNumber","params":["0x149adc6",false],"jsonrpc":"2.0"}

      Details: foo
      Version: viem@x.y.z]
    `)

    vi.unstubAllGlobals()
  })

  test('behavior: unknown error', async () => {
    const rpc = RpcAsync.fromHttp('http://127.0.0.1')

    const mock = vi
      .spyOn(withTimeout, 'withTimeout')
      .mockRejectedValueOnce(new Error('foo'))

    await expect(() =>
      rpc.request(
        {
          method: 'eth_getBlockByNumber',
          params: [Hex.fromNumber(Anvil.mainnet.config.forkBlockNumber), false],
        },
        { timeout: 10000 },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [RpcAsync.HttpError: foo

      URL: https://viem.sh/rpc
      Body: {"id":0,"method":"eth_getBlockByNumber","params":["0x149adc6",false],"jsonrpc":"2.0"}

      Details: foo
      Version: viem@x.y.z]
    `)

    mock.mockRestore()
  })

  test('behavior: batch', async () => {
    const client = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)

    expect(
      await client.request([
        { method: 'web3_clientVersion' },
        { method: 'web3_clientVersion' },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "id": 0,
          "jsonrpc": "2.0",
          "result": "anvil/v0.3.0",
        },
        {
          "id": 1,
          "jsonrpc": "2.0",
          "result": "anvil/v0.3.0",
        },
      ]
    `)
  })

  test('behavior: batch: invalid rpc params', async () => {
    const client = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)

    expect(
      await client.request([
        { method: 'web3_clientVersion' },
        { method: 'eth_getBlockByHash', params: ['0x0', false] },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "id": 0,
          "jsonrpc": "2.0",
          "result": "anvil/v0.3.0",
        },
        {
          "error": {
            "code": -32602,
            "message": "odd number of digits",
          },
          "id": 1,
          "jsonrpc": "2.0",
        },
      ]
    `)
  })

  test('behavior: batch: invalid request', async () => {
    const client = RpcAsync.fromHttp(Anvil.mainnet.rpcUrl.http)

    expect(
      await client.request([
        { method: 'web3_clientVersion' },
        { method: 'eth_wagmi' },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "id": 0,
          "jsonrpc": "2.0",
          "result": "anvil/v0.3.0",
        },
        {
          "error": {
            "code": -32601,
            "message": "Method not found",
          },
          "id": 1,
          "jsonrpc": "2.0",
        },
      ]
    `)
  })

  test('https://github.com/wevm/viem/issues/2775', async () => {
    const server = await Http.createServer((_req, res) => {
      res.writeHead(404)
      res.end('default backend - 404')
    })

    const client = RpcAsync.fromHttp(server.url)

    await expect(() =>
      client.request({
        method: 'eth_getBlockByNumber',
        params: [Hex.fromNumber(Anvil.mainnet.config.forkBlockNumber), false],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [RpcAsync.HttpError: HTTP request failed.

      Status: 404
      URL: https://viem.sh/rpc
      Body: {"id":0,"method":"eth_getBlockByNumber","params":["0x149adc6",false],"jsonrpc":"2.0"}

      Details: "default backend - 404"
      Version: viem@x.y.z]
    `,
    )
  })
})
