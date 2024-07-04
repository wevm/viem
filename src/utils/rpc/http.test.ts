import { describe, expect, test, vi } from 'vitest'

import type { IncomingHttpHeaders } from 'node:http'

import { createHttpServer } from '~test/src/utils.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getBlockNumber, mine } from '../../actions/index.js'

import { numberToHex } from '../encoding/toHex.js'
import * as withTimeout from '../promise/withTimeout.js'
import { wait } from '../wait.js'
import { getHttpRpcClient } from './http.js'

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
        "result": "anvil/v0.2.0",
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
        "id": 3,
        "jsonrpc": "2.0",
        "result": "anvil/v0.2.0",
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
          "message": "Odd number of digits",
        },
        "id": 5,
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
        "id": 7,
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
      Request body: {"method":"eth_getBlockByNumber","params":["0x12e3ffa",false]}

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
      Request body: {"method":"eth_getBlockByNumber","params":["0x12e3ffa",false]}

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
      Request body: {"method":"eth_getBlockByNumber","params":["0x12e3ffa",false]}

      Details: foo
      Version: viem@x.y.z]
    `)

    mock.mockRestore()
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
          "id": 91,
          "jsonrpc": "2.0",
          "result": "anvil/v0.2.0",
        },
        {
          "id": 92,
          "jsonrpc": "2.0",
          "result": "anvil/v0.2.0",
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
          "id": 94,
          "jsonrpc": "2.0",
          "result": "anvil/v0.2.0",
        },
        {
          "error": {
            "code": -32602,
            "message": "Odd number of digits",
          },
          "id": 95,
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
          "id": 97,
          "jsonrpc": "2.0",
          "result": "anvil/v0.2.0",
        },
        {
          "error": {
            "code": -32601,
            "message": "Method not found",
          },
          "id": 98,
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
      Request body: [{"method":"web3_clientVersion"},{"method":"eth_getBlockByNumber","params":["0x12e3ffa",false]}]

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
      Request body: [{"method":"web3_clientVersion"},{"method":"eth_getBlockByNumber","params":["0x12e3ffa",false]}]

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
      Request body: [{"method":"web3_clientVersion"},{"method":"eth_getBlockByNumber","params":["0x12e3ffa",false]}]

      Details: foo
      Version: viem@x.y.z]
    `)

    mock.mockRestore()
  })
})
