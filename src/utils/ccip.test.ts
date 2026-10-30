import { createPublicClient, HttpRequestError } from 'viem'
import { describe, expect, test } from 'vitest'

import { OffchainLookupExample } from '~contracts/generated.js'
import { anvilMainnet } from '~test/anvil.js'
import { createCcipServer } from '~test/ccip.js'
import { accounts } from '~test/constants.js'
import { createHttpServer, deployOffchainLookupExample } from '~test/utils.js'
import { createClient } from '../clients/createClient.js'
import { http } from '../clients/transports/http.js'
import { getUrl } from '../errors/utils.js'
import type { Hex } from '../types/misc.js'
import { encodeErrorResult } from './abi/encodeErrorResult.js'
import { encodeFunctionData } from './abi/encodeFunctionData.js'
import { ccipRequest, offchainLookup, offchainLookupAbiItem } from './ccip.js'
import { trim } from './data/trim.js'
import { wait } from './wait.js'

const client = anvilMainnet.getClient()

describe('offchainLookup', () => {
  test('default', async () => {
    const server = await createCcipServer()
    const { contractAddress } = await deployOffchainLookupExample({
      urls: [`${server.url}/{sender}/{data}`],
    })

    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: _
    const data = await new Promise<Hex>(async (resolve) => {
      try {
        const data = encodeFunctionData({
          abi: OffchainLookupExample.abi,
          functionName: 'getAddress',
          args: ['jxom.viem'],
        })
        await client.request({
          method: 'eth_call',
          params: [{ data, to: contractAddress! }, 'latest'],
        })
      } catch (err) {
        resolve((err as any).cause.data)
      }
    })

    const result = await offchainLookup(client, {
      data,
      to: contractAddress!,
    })

    expect(trim(result)).toEqual(accounts[0].address)
  })

  test('ccipRequest (client)', async () => {
    const server = await createCcipServer()
    const { contractAddress } = await deployOffchainLookupExample({
      urls: [`${server.url}/{sender}/{data}`],
    })

    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: _
    const data = await new Promise<Hex>(async (resolve) => {
      try {
        const data = encodeFunctionData({
          abi: OffchainLookupExample.abi,
          functionName: 'getAddress',
          args: ['jxom.viem'],
        })
        await client.request({
          method: 'eth_call',
          params: [{ data, to: contractAddress! }, 'latest'],
        })
      } catch (err) {
        resolve((err as any).cause.data)
      }
    })

    let count = 0
    let requestOptions_: unknown
    const requestOptions = { signal: new AbortController().signal }
    const client_2 = createClient({
      ccipRead: {
        request: async ({ data, requestOptions, sender, urls }) => {
          count++
          requestOptions_ = requestOptions
          return ccipRequest({ data, sender, urls })
        },
      },
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const result = await offchainLookup(client_2, {
      data,
      requestOptions,
      to: contractAddress!,
    })

    expect(trim(result)).toEqual(accounts[0].address)
    expect(count).toBe(1)
    expect(requestOptions_).toBe(requestOptions)
  })

  test('error: invalid signature', async () => {
    const server = await createCcipServer()
    const { contractAddress } = await deployOffchainLookupExample({
      urls: [`${server.url}/{sender}/{data}`],
    })

    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: _
    const data = await new Promise<Hex>(async (resolve) => {
      try {
        const data = encodeFunctionData({
          abi: OffchainLookupExample.abi,
          functionName: 'getAddress',
          args: ['fake.viem'],
        })
        await client.request({
          method: 'eth_call',
          params: [{ data, to: contractAddress! }, 'latest'],
        })
      } catch (err) {
        resolve((err as any).cause.data)
      }
    })

    await expect(() =>
      offchainLookup(client, {
        data,
        to: contractAddress!,
      }),
    ).rejects.toThrowError()
  })

  test('error: sender check', async () => {
    const server = await createCcipServer()
    const data = encodeErrorResult({
      abi: [offchainLookupAbiItem],
      errorName: 'OffchainLookup',
      args: [
        '0x0000000000000000000000000000000000000000',
        [getUrl(server.url)],
        '0xdeadbeef',
        '0xcafebabe',
        '0xdeadbeaf',
      ],
    })
    await expect(() =>
      offchainLookup(client, {
        data,
        to: '0x0000000000000000000000000000000000000001',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [OffchainLookupError: Reverted sender address does not match target contract address (\`to\`).

      Contract address: 0x0000000000000000000000000000000000000001
      OffchainLookup sender address: 0x0000000000000000000000000000000000000000

      Offchain Gateway Call:
        Gateway URL(s):
          http://localhost
        Sender: 0x0000000000000000000000000000000000000000
        Data: 0x556f1830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000120cafebabe000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010687474703a2f2f6c6f63616c686f7374000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004deadbeaf00000000000000000000000000000000000000000000000000000000
        Callback selector: 0xcafebabe
        Extra data: 0xdeadbeaf

      Version: viem@x.y.z]
    `)
  })
})

describe('ccipRequest', async () => {
  test('default', async () => {
    let url: string | undefined
    const server = await createHttpServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      url = req.url
      res.end(JSON.stringify({ data: '0xdeadbeef' }))
    })

    const result = await ccipRequest({
      data: '0xdeadbeef',
      sender: accounts[0].address,
      urls: [`${server.url}/{sender}/{data}`],
    })

    expect(result).toEqual('0xdeadbeef')
    expect(url).toEqual(
      '/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/0xdeadbeef',
    )

    await server.close()
  })

  test('result text', async () => {
    let url: string | undefined
    const server = await createHttpServer((req, res) => {
      url = req.url
      res.end('0xcafebabe')
    })

    const result = await ccipRequest({
      data: '0xdeadbeef',
      sender: accounts[0].address,
      urls: [`${server.url}/{sender}/{data}`],
    })

    expect(result).toEqual('0xcafebabe')
    expect(url).toEqual(
      '/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/0xdeadbeef',
    )

    await server.close()
  })

  test('result undefined', async () => {
    const server = await createHttpServer((_, res) => {
      res.writeHead(500)
      res.end()
    })

    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        sender: accounts[0].address,
        urls: [`${server.url}/{sender}/{data}`],
      }),
    ).rejects.toMatchInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost

      Details: Internal Server Error
      Version: viem@x.y.z]
    `)

    await server.close()
  })

  test('post method', async () => {
    let body = ''
    const server = await createHttpServer((req, res) => {
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ data: '0xcafebabe' }))
      })
    })

    const result = await ccipRequest({
      data: '0xdeadbeef',
      sender: accounts[0].address,
      urls: [server.url],
    })

    expect(result).toEqual('0xcafebabe')
    expect(body).toEqual(
      '{"data":"0xdeadbeef","sender":"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"}',
    )

    await server.close()
  })

  test('requestOptions: signal aborts request', async () => {
    const server = await createHttpServer(async (_req, res) => {
      await wait(1_000)
      res.end(JSON.stringify({ data: '0xcafebabe' }))
    })
    const controller = new AbortController()

    setTimeout(() => controller.abort(), 50)

    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        requestOptions: { signal: controller.signal },
        sender: accounts[0].address,
        urls: [`${server.url}/{sender}/{data}`],
      }),
    ).rejects.toThrowError('This operation was aborted')

    await server.close()
  })

  test('multiple urls', async () => {
    let count = 0
    let url: string | undefined
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(408)
      res.end()
    })
    const server3 = await createHttpServer((req, res) => {
      count++
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      url = req.url
      res.end(JSON.stringify({ data: '0xcafebabe' }))
    })

    const result = await ccipRequest({
      data: '0xdeadbeef',
      sender: accounts[0].address,
      urls: [
        `${server1.url}/{sender}/{data}`,
        `${server2.url}/{sender}/{data}`,
        `${server3.url}/{sender}/{data}`,
      ],
    })

    expect(count).toBe(3)
    expect(result).toEqual('0xcafebabe')
    expect(url).toEqual(
      '/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/0xdeadbeef',
    )

    await server1.close()
    await server2.close()
    await server3.close()
  })

  test('error: fetch error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.end('what is this data?')
    })
    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        sender: accounts[0].address,
        urls: ['fakeurl'],
      }),
    ).rejects.toMatchInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      URL: http://localhost

      Details: CCIP Read URL is invalid.
      Version: viem@x.y.z]
    `)

    await server.close()
  })

  test('error: malformed gateway response', async () => {
    const server = await createHttpServer((_req, res) => {
      res.end('what is this data?')
    })
    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        sender: accounts[0].address,
        urls: [`${server.url}/{sender}/{data}`],
      }),
    ).rejects.toMatchInlineSnapshot(`
      [OffchainLookupResponseMalformedError: Offchain gateway response is malformed. Response data must be a hex value.

      Gateway URL: http://localhost
      Response: "what is this data?"

      Version: viem@x.y.z]
    `)

    await server.close()
  })

  test('error: http error', async () => {
    let count = 0
    const server1 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(500)
      res.end()
    })
    const server2 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(408)
      res.end()
    })
    const server3 = await createHttpServer((_req, res) => {
      count++
      res.writeHead(403)
      res.end()
    })

    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        sender: accounts[0].address,
        urls: [
          `${server1.url}/{sender}/{data}`,
          `${server2.url}/{sender}/{data}`,
          `${server3.url}/{sender}/{data}`,
        ],
      }),
    ).rejects.toMatchInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      Status: 403
      URL: http://localhost

      Details: Forbidden
      Version: viem@x.y.z]
    `)
    expect(count).toBe(3)

    await server1.close()
    await server2.close()
    await server3.close()
  })

  test('error: non-http scheme', async () => {
    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        sender: accounts[0].address,
        urls: ['file:///etc/passwd'],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      URL: http://localhost

      Details: CCIP Read URL scheme "file" is not allowed.
      Version: viem@x.y.z]
    `)
  })

  test('error: response too large', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Length': String(10_485_761),
        'Content-Type': 'text/plain',
      })
      res.end('x')
    })

    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        sender: accounts[0].address,
        urls: [server.url],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ResponseBodyTooLargeError: HTTP response body exceeded the size limit.

      Max: 10485760 bytes
      Received: 10485761 bytes

      Version: viem@x.y.z]
    `)

    await server.close()
  })

  test('error: gateway timeout', async () => {
    const server = await createHttpServer(async (_req, res) => {
      await wait(5_000)
      res.end('0x')
    })

    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        sender: accounts[0].address,
        timeout: 50,
        urls: [`${server.url}/{sender}/{data}`],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TimeoutError: The request took too long to respond.

      URL: http://localhost
      Request body: {"data":"0xdeadbeef","sender":"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"}

      Details: The request timed out.
      Version: viem@x.y.z]
    `)

    await server.close()
  })

  test('tries every url', async () => {
    const seen: string[] = []
    const server = await createHttpServer((req, res) => {
      seen.push(req.url ?? '')
      res.writeHead(500)
      res.end()
    })

    await expect(() =>
      ccipRequest({
        data: '0xdeadbeef',
        sender: accounts[0].address,
        urls: Array.from({ length: 9 }, (_, i) => `${server.url}/u${i}`),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      Status: 500
      URL: http://localhost
      Request body: {"data":"0xdeadbeef","sender":"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"}

      Details: Internal Server Error
      Version: viem@x.y.z]
    `)
    expect([...seen].sort()).toMatchInlineSnapshot(`
      [
        "/u0",
        "/u1",
        "/u2",
        "/u3",
        "/u4",
        "/u5",
        "/u6",
        "/u7",
        "/u8",
      ]
    `)

    await server.close()
  })

  test('callback depth', async () => {
    const seen: string[] = []
    const gateway = await createHttpServer((req, res) => {
      seen.push(req.url ?? '')
      res.end('0xabcd')
    })

    const contract = '0x0000000000000000000000000000000000000001' as const
    const revertData = encodeErrorResult({
      abi: [offchainLookupAbiItem],
      errorName: 'OffchainLookup',
      args: [
        contract,
        [`${gateway.url}/{sender}/{data}`],
        '0x',
        '0xcafebabe',
        '0x',
      ],
    })
    const rpc = await createHttpServer(async (req, res) => {
      let body = ''
      for await (const chunk of req) body += chunk
      const request = JSON.parse(body) as { id?: number }
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          error: {
            code: 3,
            message: 'execution reverted',
            data: revertData,
          },
        }),
      )
    })
    const publicClient = createPublicClient({ transport: http(rpc.url) })

    const caught = await publicClient.call({ data: '0x', to: contract }).then(
      () => undefined,
      (error: unknown) => error,
    )

    const cause = (() => {
      let current = caught
      while (current instanceof Error) {
        if (current instanceof HttpRequestError) return current
        current = current.cause
      }
      return undefined
    })()
    expect(cause?.details).toMatchInlineSnapshot(
      `"CCIP Read exceeded the maximum callback depth (4)."`,
    )
    expect(seen).toMatchInlineSnapshot(`
      [
        "/0x0000000000000000000000000000000000000001/0x",
        "/0x0000000000000000000000000000000000000001/0x",
        "/0x0000000000000000000000000000000000000001/0x",
        "/0x0000000000000000000000000000000000000001/0x",
      ]
    `)

    await gateway.close()
    await rpc.close()
  })

  test('callback result', async () => {
    const gateway = await createHttpServer((_req, res) => {
      res.end('0xabcd')
    })

    const contract = '0x0000000000000000000000000000000000000001' as const
    const revertData = encodeErrorResult({
      abi: [offchainLookupAbiItem],
      errorName: 'OffchainLookup',
      args: [
        contract,
        [`${gateway.url}/{sender}/{data}`],
        '0x',
        '0xcafebabe',
        '0x',
      ],
    })
    const rpc = await createHttpServer(async (req, res) => {
      let body = ''
      for await (const chunk of req) body += chunk
      const request = JSON.parse(body) as {
        id?: number
        params?: readonly [{ data?: string }]
      }
      const data = request.params?.[0]?.data
      res.setHeader('Content-Type', 'application/json')
      const payload =
        data === '0x'
          ? {
              error: {
                code: 3,
                message: 'execution reverted',
                data: revertData,
              },
            }
          : { result: '0x1234' }
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', ...payload }))
    })
    const publicClient = createPublicClient({ transport: http(rpc.url) })

    await expect(
      publicClient.call({ data: '0x', to: contract }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "data": "0x1234",
      }
    `)

    await gateway.close()
    await rpc.close()
  })
})
