import type { IncomingHttpHeaders } from 'node:http'
import { describe, expect, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { createHttpServer } from '~test/utils.js'
import { getBlockNumber, mine } from '../../actions/index.js'
import { keccak256 } from '../../index.js'
import { numberToHex, toHex } from '../encoding/toHex.js'
import * as withTimeout from '../promise/withTimeout.js'
import { wait } from '../wait.js'
import { getHttpRpcClient, parseUrl } from './http.js'

const client = anvilMainnet.getClient()

describe('request', () => {
  test('valid request', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)
    expect(
      await client.request({
        body: { method: 'web3_clientVersion' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "id": 1,
        "jsonrpc": "2.0",
        "result": "anvil/v1.5.0",
      }
    `)
  })

  test('valid request w/ incremented id', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)
    expect(
      await client.request({
        body: { method: 'web3_clientVersion' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "id": 1,
        "jsonrpc": "2.0",
        "result": "anvil/v1.5.0",
      }
    `)
  })

  test('invalid rpc params', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)
    await expect(
      client.request({
        body: { method: 'eth_getBlockByHash', params: ['0x0', false] },
      }),
    ).resolves.toMatchInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "odd number of digits",
        },
        "id": 1,
        "jsonrpc": "2.0",
      }
    `,
    )
  })

  test('invalid request', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)
    await expect(
      client.request({
        body: { method: 'eth_wagmi' },
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "error": {
          "code": -32601,
          "message": "Method not found",
        },
        "id": 1,
        "jsonrpc": "2.0",
      }
    `)
  })

  test('serial requests', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)
    const response: any = []
    for (const i in Array.from({ length: 10 })) {
      response.push(
        await client.request({
          body: {
            method: 'eth_getBlockByNumber',
            params: [
              numberToHex(anvilMainnet.forkBlockNumber - BigInt(i)),
              false,
            ],
          },
        }),
      )
    }
    expect(response.map((r: any) => r.result.number)).toEqual(
      Array.from({ length: 10 }).map((_, i) =>
        numberToHex(anvilMainnet.forkBlockNumber - BigInt(i)),
      ),
    )
  })

  test('parallel requests', async () => {
    const rpcClient = getHttpRpcClient(anvilMainnet.rpcUrl.http)

    await wait(500)

    await mine(client, { blocks: 100 })
    const blockNumber = await getBlockNumber(client)

    const response = await Promise.all(
      Array.from({ length: 50 }).map(async (_, i) => {
        return await rpcClient.request({
          body: {
            method: 'eth_getBlockByNumber',
            params: [numberToHex(blockNumber - BigInt(i)), false],
          },
        })
      }),
    )
    expect(response.map((r) => r.result.number)).toEqual(
      Array.from({ length: 50 }).map((_, i) =>
        numberToHex(blockNumber - BigInt(i)),
      ),
    )
    await wait(500)
  })

  test('no application/json header', async () => {
    const server = await createHttpServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })
    const client = getHttpRpcClient(server.url)
    expect(
      await client.request({
        body: { method: 'web3_clientVersion' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "result": "0x1",
      }
    `)
    await server.close()

    const server2 = await createHttpServer((_, res) => {
      res.end('bogus')
    })
    const client2 = getHttpRpcClient(server2.url)
    await expect(() =>
      client2.request({
        body: { method: 'web3_clientVersion' },
      }),
    ).rejects.toMatchInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      URL: http://localhost
      Request body: {"method":"web3_clientVersion"}

      Details: Unexpected token 'b', "bogus" is not valid JSON
      Version: viem@x.y.z]
    `)
    await server2.close()
  })

  test('fetchOptions', async () => {
    let headers: IncomingHttpHeaders = {}
    const server = await createHttpServer((req, res) => {
      headers = req.headers
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const client = getHttpRpcClient(server.url)

    expect(
      await client.request({
        body: { method: 'web3_clientVersion' },
        fetchOptions: {
          headers: { 'x-wagmi': 'gm' },
          cache: 'force-cache',
          method: 'PATCH',
          signal: null,
        },
      }),
    ).toBeDefined()
    expect(headers['x-wagmi']).toBeDefined()

    await server.close()
  })

  test('onRequest', async () => {
    const server = await createHttpServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const requests: Request[] = []
    const client = getHttpRpcClient(server.url, {
      onRequest: (request) => {
        requests.push(request)
      },
    })
    await client.request({
      body: { method: 'web3_clientVersion' },
    })
    await client.request({
      body: { method: 'web3_clientVersion' },
      onRequest: (request) => {
        requests.push(request)
      },
    })

    expect(requests.length).toBe(2)

    await server.close()
  })

  test('onRequest can return an override request', async () => {
    let headers: IncomingHttpHeaders = {}
    const server = await createHttpServer((req, res) => {
      headers = req.headers
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const client = getHttpRpcClient(server.url, {
      onRequest: async (request) => {
        // simulate a middleware that hashes the body - example might be authenticated service such
        // as flashbots RPC which requires an auth header that is a signature of the request body
        const newRequest = request.clone()
        const text = await request.text()
        newRequest.headers.set('x-body-hash', keccak256(toHex(text)))

        return newRequest
      },
    })
    await client.request({
      body: { method: 'web3_clientVersion' },
    })
    expect(headers['x-body-hash']).toBe(
      '0xd33705e291769e17b5e005a861bb933ce3925f325bf9127772f07f14bb7d0b25',
    )
  })

  test('onResponse', async () => {
    const server = await createHttpServer((_, res) => {
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const responses: Response[] = []
    const client = getHttpRpcClient(server.url, {
      onResponse: (response) => {
        responses.push(response)
      },
    })
    await client.request({
      body: { method: 'web3_clientVersion' },
    })
    await client.request({
      body: { method: 'web3_clientVersion' },
      onResponse: (response) => {
        responses.push(response)
      },
    })

    expect(responses.length).toBe(2)

    await server.close()
  })

  test('http error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: 'ngmi' }))
    })

    const client = getHttpRpcClient(server.url)

    await expect(() =>
      client.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(anvilMainnet.forkBlockNumber), false],
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: {"method":"eth_getBlockByNumber","params":["0x153b747",false]}

      Details: "ngmi"
      Version: viem@x.y.z]
    `)
  })

  test('http error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(500)
      res.end()
    })

    const client = getHttpRpcClient(server.url)

    await expect(() =>
      client.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(anvilMainnet.forkBlockNumber), false],
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: {"method":"eth_getBlockByNumber","params":["0x153b747",false]}

      Details: Internal Server Error
      Version: viem@x.y.z]
    `,
    )
  })

  test('fetch error', async () => {
    vi.stubGlobal('fetch', () => {
      throw new Error('foo', { cause: new Error('bar') })
    })

    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)

    try {
      await client.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(anvilMainnet.forkBlockNumber), false],
        },
      })
    } catch (error) {
      expect((error as Error).cause).toMatchInlineSnapshot('[Error: foo]')
    }

    vi.unstubAllGlobals()
  })

  test('fetch override', async () => {
    const fetchOverride = vi.fn(fetch)

    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http, {
      fetchFn: fetchOverride,
    })

    await client.request({
      body: { method: 'web3_clientVersion' },
    })

    expect(fetchOverride).toHaveBeenCalled()
  })

  // TODO: This is flaky.
  test.skip('timeout', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)

    await expect(() =>
      client.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(anvilMainnet.forkBlockNumber), false],
        },
        timeout: 1,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      "The request took too long to respond.

      URL: http://localhost
      Request body: {\\"method\\":\\"eth_getBlockByNumber\\",\\"params\\":[\\"0xf86cc2\\",false]}

      Details: The request timed out.
      Version: viem@x.y.z"
    `,
    )
  })

  test('unknown', async () => {
    const client = getHttpRpcClient('http://127.0.0.1')

    const mock = vi
      .spyOn(withTimeout, 'withTimeout')
      .mockRejectedValueOnce(new Error('foo'))

    await expect(() =>
      client.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(anvilMainnet.forkBlockNumber), false],
        },
        timeout: 10000,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      URL: http://localhost
      Request body: {"method":"eth_getBlockByNumber","params":["0x153b747",false]}

      Details: foo
      Version: viem@x.y.z]
    `)

    mock.mockRestore()
  })

  describe('basic auth', () => {
    test('sends Authorization header from embedded credentials', async () => {
      let headers: IncomingHttpHeaders = {}
      const server = await createHttpServer((req, res) => {
        headers = req.headers
        res.end(JSON.stringify({ result: '0x1' }))
      })

      const url = new URL(server.url)
      url.username = 'testuser'
      url.password = 'testpass'

      const client = getHttpRpcClient(url.toString())
      await client.request({
        body: { method: 'web3_clientVersion' },
      })

      expect(headers.authorization).toBe(`Basic ${btoa('testuser:testpass')}`)

      await server.close()
    })

    test('fetchOptions headers take precedence over embedded auth', async () => {
      let headers: IncomingHttpHeaders = {}
      const server = await createHttpServer((req, res) => {
        headers = req.headers
        res.end(JSON.stringify({ result: '0x1' }))
      })

      const url = new URL(server.url)
      url.username = 'testuser'
      url.password = 'testpass'

      const client = getHttpRpcClient(url.toString())
      await client.request({
        body: { method: 'web3_clientVersion' },
        fetchOptions: {
          headers: { Authorization: 'Bearer custom-token' },
        },
      })

      expect(headers.authorization).toBe('Bearer custom-token')

      await server.close()
    })
  })
})

describe('http (batch)', () => {
  test('valid request', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)

    expect(
      await client.request({
        body: [
          { method: 'web3_clientVersion' },
          { method: 'web3_clientVersion' },
        ],
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "id": 1,
          "jsonrpc": "2.0",
          "result": "anvil/v1.5.0",
        },
        {
          "id": 2,
          "jsonrpc": "2.0",
          "result": "anvil/v1.5.0",
        },
      ]
    `)
  })

  test('invalid rpc params', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)

    expect(
      await client.request({
        body: [
          { method: 'web3_clientVersion' },
          { method: 'eth_getBlockByHash', params: ['0x0', false] },
        ],
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "id": 1,
          "jsonrpc": "2.0",
          "result": "anvil/v1.5.0",
        },
        {
          "error": {
            "code": -32602,
            "message": "odd number of digits",
          },
          "id": 2,
          "jsonrpc": "2.0",
        },
      ]
    `)
  })

  test('invalid request', async () => {
    const client = getHttpRpcClient(anvilMainnet.rpcUrl.http)

    expect(
      await client.request({
        body: [{ method: 'web3_clientVersion' }, { method: 'eth_wagmi' }],
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "id": 1,
          "jsonrpc": "2.0",
          "result": "anvil/v1.5.0",
        },
        {
          "error": {
            "code": -32601,
            "message": "Method not found",
          },
          "id": 2,
          "jsonrpc": "2.0",
        },
      ]
    `)
  })

  test('http error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ error: 'ngmi' }))
    })

    const client = getHttpRpcClient(server.url)

    await expect(() =>
      client.request({
        body: [
          { method: 'web3_clientVersion' },
          {
            method: 'eth_getBlockByNumber',
            params: [numberToHex(anvilMainnet.forkBlockNumber), false],
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: [{"method":"web3_clientVersion"},{"method":"eth_getBlockByNumber","params":["0x153b747",false]}]

      Details: "ngmi"
      Version: viem@x.y.z]
    `)
  })

  test('http error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(500)
      res.end()
    })

    const client = getHttpRpcClient(server.url)

    await expect(() =>
      client.request({
        body: [
          { method: 'web3_clientVersion' },
          {
            method: 'eth_getBlockByNumber',
            params: [numberToHex(anvilMainnet.forkBlockNumber), false],
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: [{"method":"web3_clientVersion"},{"method":"eth_getBlockByNumber","params":["0x153b747",false]}]

      Details: Internal Server Error
      Version: viem@x.y.z]
    `,
    )
  })

  test('unknown', async () => {
    const client = getHttpRpcClient('http://127.0.0.1')

    const mock = vi
      .spyOn(withTimeout, 'withTimeout')
      .mockRejectedValueOnce(new Error('foo'))

    await expect(() =>
      client.request({
        body: [
          { method: 'web3_clientVersion' },
          {
            method: 'eth_getBlockByNumber',
            params: [numberToHex(anvilMainnet.forkBlockNumber), false],
          },
        ],
        timeout: 10000,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      URL: http://localhost
      Request body: [{"method":"web3_clientVersion"},{"method":"eth_getBlockByNumber","params":["0x153b747",false]}]

      Details: foo
      Version: viem@x.y.z]
    `)

    mock.mockRestore()
  })
})

describe('parseUrl', () => {
  test('default', () => {
    expect(parseUrl('https://rpc.example.com')).toEqual({
      url: 'https://rpc.example.com/',
    })
  })

  test('behavior: with username and password', () => {
    expect(parseUrl('https://foo:bar@rpc.example.com')).toEqual({
      url: 'https://rpc.example.com/',
      headers: { Authorization: `Basic ${btoa('foo:bar')}` },
    })
  })

  test('behavior: with username only', () => {
    expect(parseUrl('https://foo@rpc.example.com')).toEqual({
      url: 'https://rpc.example.com/',
      headers: { Authorization: `Basic ${btoa('foo:')}` },
    })
  })

  test('behavior: with url-encoded credentials', () => {
    expect(parseUrl('https://user%40email.com:p%40ss@rpc.example.com')).toEqual(
      {
        url: 'https://rpc.example.com/',
        headers: { Authorization: `Basic ${btoa('user@email.com:p@ss')}` },
      },
    )
  })

  test('behavior: with port and path', () => {
    expect(parseUrl('https://foo:bar@rpc.example.com:8545/v1')).toEqual({
      url: 'https://rpc.example.com:8545/v1',
      headers: { Authorization: `Basic ${btoa('foo:bar')}` },
    })
  })
})

test('https://github.com/wevm/viem/issues/2775', async () => {
  const server = await createHttpServer((_req, res) => {
    res.writeHead(404)
    res.end('default backend - 404')
  })

  const client = getHttpRpcClient(server.url)

  await expect(() =>
    client.request({
      body: {
        method: 'eth_getBlockByNumber',
        params: [numberToHex(anvilMainnet.forkBlockNumber), false],
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [HttpRequestError: HTTP request failed.

    Status: 404
    URL: http://localhost
    Request body: {"method":"eth_getBlockByNumber","params":["0x153b747",false]}

    Details: "default backend - 404"
    Version: viem@x.y.z]
  `,
  )
})
