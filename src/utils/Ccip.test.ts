import { describe, expect, test, vi } from 'vp/test'

import * as AbiFunction from './AbiFunction.js'
import * as Ccip from './Ccip.js'

const sender = '0xF39Fd6e51aad88F6F4cE6AB8827279cffFb92266'
const data = '0xdeadbeef'

const batchGatewayAbi = [
  {
    name: 'query',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        type: 'tuple[]',
        name: 'queries',
        components: [
          {
            type: 'address',
            name: 'sender',
          },
          {
            type: 'string[]',
            name: 'urls',
          },
          {
            type: 'bytes',
            name: 'data',
          },
        ],
      },
    ],
    outputs: [
      {
        type: 'bool[]',
        name: 'failures',
      },
      {
        type: 'bytes[]',
        name: 'responses',
      },
    ],
  },
] as const

describe('request', () => {
  test('behavior: performs get requests when the url has a data placeholder', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: '0xcafebabe' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await Ccip.request({
      data,
      sender,
      urls: ['https://example.com/{sender}/{data}'],
    })

    expect({
      calls: fetch.mock.calls.map(([url, options]) => ({
        body: options?.body,
        method: options?.method,
        url,
      })),
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "body": undefined,
            "method": "GET",
            "url": "https://example.com/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/0xdeadbeef",
          },
        ],
        "result": "0xcafebabe",
      }
    `)

    fetch.mockRestore()
  })

  test('behavior: performs post requests when the url has no data placeholder', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: '0xcafebabe' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await Ccip.request({
      data,
      sender,
      urls: ['https://example.com'],
    })

    expect({
      calls: fetch.mock.calls.map(([url, options]) => ({
        body: options?.body,
        headers: options?.headers,
        method: options?.method,
        url,
      })),
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "body": "{"data":"0xdeadbeef","sender":"0xF39Fd6e51aad88F6F4cE6AB8827279cffFb92266"}",
            "headers": {
              "Content-Type": "application/json",
            },
            "method": "POST",
            "url": "https://example.com",
          },
        ],
        "result": "0xcafebabe",
      }
    `)

    fetch.mockRestore()
  })

  test('behavior: falls back across gateway urls', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(undefined, {
          status: 500,
          statusText: 'Internal Server Error',
        }),
      )
      .mockResolvedValueOnce(new Response('0xcafebabe'))

    const result = await Ccip.request({
      data,
      sender,
      urls: [
        'https://one.example.com/{sender}/{data}',
        'https://two.example.com/{sender}/{data}',
      ],
    })

    expect({
      calls: fetch.mock.calls.length,
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": 2,
        "result": "0xcafebabe",
      }
    `)

    fetch.mockRestore()
  })

  test('behavior: throws the last http error when all gateways fail', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(undefined, {
          status: 500,
          statusText: 'Internal Server Error',
        }),
      )
      .mockResolvedValueOnce(
        new Response(undefined, {
          status: 403,
          statusText: 'Forbidden',
        }),
      )

    await expect(() =>
      Ccip.request({
        data,
        sender,
        urls: ['https://one.example.com', 'https://two.example.com'],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [HttpRequestError: HTTP request failed.

      Status: 403
      URL: https://two.example.com
      Request body: {"data":"0xdeadbeef","sender":"0xF39Fd6e51aad88F6F4cE6AB8827279cffFb92266"}

      Details: Forbidden
      Version: viem@2.49.3]
    `)

    fetch.mockRestore()
  })

  test('behavior: rejects malformed gateway responses', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('what is this data?'))

    await expect(() =>
      Ccip.request({
        data,
        sender,
        urls: ['https://example.com/{sender}/{data}'],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Ccip.ResponseMalformedError: Offchain gateway response is malformed. Response data must be a hex value.

      Gateway URL: https://example.com/{sender}/{data}
      Response: "what is this data?"

      Version: viem@2.49.3]
    `)

    fetch.mockRestore()
  })

  test('behavior: aborts before performing a request', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    const controller = new AbortController()
    controller.abort(new Error('aborted'))

    await expect(() =>
      Ccip.request({
        data,
        requestOptions: { signal: controller.signal },
        sender,
        urls: ['https://example.com/{sender}/{data}'],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: aborted]`)

    expect(fetch.mock.calls.length).toMatchInlineSnapshot(`0`)
    fetch.mockRestore()
  })
})

describe('createTunnel', () => {
  test('behavior: forwards local batch gateway requests to configured batch gateways', async () => {
    const requests: Ccip.request.Options[] = []
    const ccipRead = Ccip.createTunnel({
      batchGateways: ['https://batch.example.com'],
      async request(options) {
        requests.push(options)
        return '0xcafebabe'
      },
    })

    const result = await ccipRead.request({
      data,
      sender,
      urls: ['x-batch-gateway:true'],
    })

    expect({
      requests,
      result,
    }).toMatchInlineSnapshot(`
      {
        "requests": [
          {
            "data": "0xdeadbeef",
            "requestOptions": undefined,
            "sender": "0xF39Fd6e51aad88F6F4cE6AB8827279cffFb92266",
            "urls": [
              "https://batch.example.com",
            ],
          },
        ],
        "result": "0xcafebabe",
      }
    `)
  })

  test('behavior: tunnels gateway requests through a batch gateway', async () => {
    const requests: Ccip.request.Options[] = []
    const ccipRead = Ccip.createTunnel({
      batchGateways: ['https://batch.example.com'],
      async request(options) {
        requests.push(options)
        return AbiFunction.encodeResult(batchGatewayAbi, 'query', [
          [false],
          ['0xcafebabe'],
        ])
      },
    })

    const result = await ccipRead.request({
      data,
      sender,
      urls: ['https://example.com/{sender}/{data}'],
    })
    const [queries] = AbiFunction.decodeData(
      batchGatewayAbi,
      requests[0]!.data,
    ) as [
      readonly {
        data: string
        sender: string
        urls: readonly string[]
      }[],
    ]

    expect({
      query: queries[0],
      request: { ...requests[0], data: '<encoded>' },
      result,
    }).toMatchInlineSnapshot(`
      {
        "query": {
          "data": "0xdeadbeef",
          "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "urls": [
            "https://example.com/{sender}/{data}",
          ],
        },
        "request": {
          "data": "<encoded>",
          "requestOptions": undefined,
          "sender": "0xF39Fd6e51aad88F6F4cE6AB8827279cffFb92266",
          "urls": [
            "https://batch.example.com",
          ],
        },
        "result": "0xcafebabe",
      }
    `)
  })
})
