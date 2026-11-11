import { expect, test } from 'vitest'
import { createHttpServer } from '~test/utils.js'
import { batchGatewayAbi } from '../../constants/abis.js'
import { solidityError } from '../../constants/solidity.js'
import { decodeErrorResult } from '../abi/decodeErrorResult.js'
import { decodeFunctionResult } from '../abi/decodeFunctionResult.js'
import { encodeErrorResult } from '../abi/encodeErrorResult.js'
import { encodeFunctionData } from '../abi/encodeFunctionData.js'
import { encodeFunctionResult } from '../abi/encodeFunctionResult.js'
import { ccipRequest } from '../ccip.js'
import { wait } from '../wait.js'
import {
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from './localBatchGatewayRequest.js'

test('default', async () => {
  const sender = '0x0000000000000000000000000000000000000001'
  const server = await createHttpServer((req, res) => {
    const path = req.url ?? ''
    if (path.startsWith('/empty')) {
      res.end('0x')
      return
    }
    if (path.startsWith('/value')) {
      res.end('0x12345678')
      return
    }
    if (path.startsWith('/nested')) {
      res.end('0xabcdef')
      return
    }
    res.end('chonk')
  })
  const data = encodeFunctionData({
    abi: batchGatewayAbi,
    functionName: 'query',
    args: [
      [
        {
          sender,
          data: '0x',
          urls: [`${server.url}/empty`],
        },
        {
          sender,
          data: '0x',
          urls: [`${server.url}/value`],
        },
        {
          sender,
          data: '0x',
          urls: [], // no urls
        },
        {
          sender,
          data: '0x',
          urls: ['_'], // invalid url
        },
        {
          sender,
          data: '0x',
          urls: [`${server.url}/text`], // OffchainLookupResponseMalformedError
        },
        {
          sender,
          data: encodeFunctionData({
            abi: batchGatewayAbi,
            functionName: 'query',
            args: [
              [
                {
                  sender,
                  data: '0x',
                  urls: [`${server.url}/nested`],
                },
              ],
            ],
          }),
          urls: [localBatchGatewayUrl], // recursion
        },
      ],
    ],
  })

  const result = await localBatchGatewayRequest({ data, ccipRequest })

  await server.close()

  const [failures, responses] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data: result,
  })

  expect(failures, 'failures').toEqual([false, false, true, true, true, false])
  expect(responses[0]).toStrictEqual('0x')
  expect(responses[1]).toStrictEqual('0x12345678')
  expect(responses[2]).toStrictEqual(
    encodeErrorResult({
      abi: [solidityError],
      errorName: 'Error',
      args: ['An unknown error occurred.'],
    }),
  )
  expect(responses[3]).toStrictEqual(
    encodeErrorResult({
      abi: [solidityError],
      errorName: 'Error',
      args: ['HTTP request failed.'],
    }),
  )
  expect(responses[4]).toStrictEqual(
    encodeErrorResult({
      abi: [solidityError],
      errorName: 'Error',
      args: [
        'Offchain gateway response is malformed. Response data must be a hex value.',
      ],
    }),
  )
  expect(responses[5]).toStrictEqual(
    encodeFunctionResult({
      abi: batchGatewayAbi,
      functionName: 'query',
      result: [[false], ['0xabcdef']],
    }),
  )
})

test('behavior: empty', async () => {
  await expect(
    localBatchGatewayRequest({
      data: encodeFunctionData({
        abi: batchGatewayAbi,
        functionName: 'query',
        args: [[]],
      }),
      ccipRequest,
    }),
  ).resolves.toStrictEqual(
    encodeFunctionResult({
      abi: batchGatewayAbi,
      functionName: 'query',
      result: [[], []],
    }),
  )
})

test('behavior: http error', async () => {
  const server = await createHttpServer((_req, res) => {
    res.writeHead(400)
    res.end()
  })

  const data = await localBatchGatewayRequest({
    data: encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        [
          {
            sender: '0x0000000000000000000000000000000000000000',
            data: '0x',
            urls: [server.url],
          },
        ],
      ],
    }),
    ccipRequest,
  })

  await server.close()

  const [failures, responses] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data,
  })

  expect(failures).toEqual([true])
  expect(responses[0]).toStrictEqual(
    encodeErrorResult({
      abi: batchGatewayAbi,
      errorName: 'HttpError',
      args: [400, 'HTTP request failed.'],
    }),
  )
})

test('batch runs every query', async () => {
  const sender = '0x0000000000000000000000000000000000000001' as const
  const seen: string[] = []
  const server = await createHttpServer((req, res) => {
    seen.push(req.url ?? '')
    res.end('0x')
  })

  const result = await localBatchGatewayRequest({
    data: encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        Array.from({ length: 9 }, (_, i) => ({
          sender,
          data: '0x' as const,
          urls: [`${server.url}/u${i}`],
        })),
      ],
    }),
    ccipRequest,
  })

  await server.close()

  const [failures] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data: result,
  })
  expect(failures).toMatchInlineSnapshot(`
    [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]
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
})

test('nested batch runs every inner query', async () => {
  const sender = '0x0000000000000000000000000000000000000001' as const
  const seen: string[] = []
  const server = await createHttpServer((req, res) => {
    seen.push(req.url ?? '')
    res.end('0x')
  })
  const inner = encodeFunctionData({
    abi: batchGatewayAbi,
    functionName: 'query',
    args: [
      Array.from({ length: 9 }, (_, i) => ({
        sender,
        data: '0x' as const,
        urls: [`${server.url}/n${i}`],
      })),
    ],
  })

  const result = await localBatchGatewayRequest({
    data: encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        [
          {
            sender,
            data: inner,
            urls: [localBatchGatewayUrl],
          },
        ],
      ],
    }),
    ccipRequest,
  })

  await server.close()

  const [failures, responses] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data: result,
  })
  const [innerFailures] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data: responses[0] ?? '0x',
  })
  expect(failures).toMatchInlineSnapshot(`
    [
      false,
    ]
  `)
  expect(innerFailures).toMatchInlineSnapshot(`
    [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]
  `)
  expect([...seen].sort()).toMatchInlineSnapshot(`
    [
      "/n0",
      "/n1",
      "/n2",
      "/n3",
      "/n4",
      "/n5",
      "/n6",
      "/n7",
      "/n8",
    ]
  `)
})

test('nested batch depth', async () => {
  const sender = '0x0000000000000000000000000000000000000001'
  const seen: string[] = []
  const server = await createHttpServer((req, res) => {
    seen.push(req.url ?? '')
    res.end('0x')
  })

  let allowed = encodeFunctionData({
    abi: batchGatewayAbi,
    functionName: 'query',
    args: [
      [
        {
          sender,
          data: '0x',
          urls: [`${server.url}/leaf`],
        },
      ],
    ],
  })
  for (let i = 0; i < 3; i++)
    allowed = encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        [
          {
            sender,
            data: allowed,
            urls: [localBatchGatewayUrl],
          },
        ],
      ],
    })

  await localBatchGatewayRequest({ data: allowed, ccipRequest })

  expect([...seen]).toMatchInlineSnapshot(`
    [
      "/leaf",
    ]
  `)

  seen.length = 0
  let blocked = encodeFunctionData({
    abi: batchGatewayAbi,
    functionName: 'query',
    args: [
      [
        {
          sender,
          data: '0x',
          urls: [`${server.url}/blocked`],
        },
      ],
    ],
  })
  for (let i = 0; i < 4; i++)
    blocked = encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        [
          {
            sender,
            data: blocked,
            urls: [localBatchGatewayUrl],
          },
        ],
      ],
    })

  await localBatchGatewayRequest({ data: blocked, ccipRequest })

  await server.close()

  expect(seen).toMatchInlineSnapshot(`[]`)
})

test('query limit', async () => {
  const sender = '0x0000000000000000000000000000000000000001' as const
  const seen: string[] = []
  const server = await createHttpServer((req, res) => {
    seen.push(req.url ?? '')
    res.end('0x')
  })
  const query = (i: number) => ({
    sender,
    data: '0x' as const,
    urls: [`${server.url}/q${i}`],
  })
  const inner = encodeFunctionData({
    abi: batchGatewayAbi,
    functionName: 'query',
    args: [Array.from({ length: 200 }, (_, i) => query(i))],
  })

  const result = await localBatchGatewayRequest({
    data: encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        [
          { sender, data: inner, urls: [localBatchGatewayUrl] },
          ...Array.from({ length: 100 }, (_, i) => query(200 + i)),
        ],
      ],
    }),
    ccipRequest,
  })

  await server.close()

  const [failures, responses] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data: result,
  })
  const [innerFailures] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data: responses[0] ?? '0x',
  })
  expect({
    failed: [...innerFailures, ...failures.slice(1)].filter(Boolean).length,
    fetched: seen.length,
    message: decodeErrorResult({
      abi: [solidityError],
      data: responses.at(-1) ?? '0x',
    }).args,
  }).toMatchInlineSnapshot(`
    {
      "failed": 44,
      "fetched": 256,
      "message": [
        "HTTP request failed.",
      ],
    }
  `)
})

test('concurrency limit', async () => {
  const sender = '0x0000000000000000000000000000000000000001' as const
  let active = 0
  let peak = 0
  const server = await createHttpServer(async (_req, res) => {
    active++
    peak = Math.max(peak, active)
    await wait(20)
    active--
    res.end('0x')
  })
  const query = (i: number) => ({
    sender,
    data: '0x' as const,
    urls: [`${server.url}/c${i}`],
  })
  const inner = encodeFunctionData({
    abi: batchGatewayAbi,
    functionName: 'query',
    args: [Array.from({ length: 20 }, (_, i) => query(i))],
  })

  const result = await localBatchGatewayRequest({
    data: encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        [
          { sender, data: inner, urls: [localBatchGatewayUrl] },
          ...Array.from({ length: 20 }, (_, i) => query(20 + i)),
        ],
      ],
    }),
    ccipRequest,
  })

  await server.close()

  const [failures] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data: result,
  })
  expect({
    failed: failures.filter(Boolean).length,
    peak,
  }).toMatchInlineSnapshot(`
    {
      "failed": 0,
      "peak": 16,
    }
  `)
})

test('query without urls draws from the budget', async () => {
  const sender = '0x0000000000000000000000000000000000000001' as const
  const tunnelled: string[] = []
  const server = await createHttpServer((req, res) => {
    tunnelled.push(req.url ?? '')
    res.end('0x')
  })

  await localBatchGatewayRequest({
    data: encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        Array.from({ length: 300 }, () => ({
          sender,
          data: '0x' as const,
          urls: [],
        })),
      ],
    }),
    ccipRequest: (parameters) =>
      ccipRequest({ ...parameters, urls: [server.url] }),
  })

  await server.close()

  expect(tunnelled.length).toMatchInlineSnapshot(`256`)
})

test('response size limit', async () => {
  const sender = '0x0000000000000000000000000000000000000001' as const
  const server = await createHttpServer((_req, res) => {
    res.end(`0x${'00'.repeat(1_048_576)}`)
  })
  const query = (i: number) => ({
    sender,
    data: '0x' as const,
    urls: [`${server.url}/b${i}`],
  })
  // A nested batch of `inner` queries next to `outer` direct ones.
  const batch = (inner: number, outer: number) =>
    encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        [
          {
            sender,
            data: encodeFunctionData({
              abi: batchGatewayAbi,
              functionName: 'query',
              args: [Array.from({ length: inner }, (_, i) => query(i))],
            }),
            urls: [localBatchGatewayUrl],
          },
          ...Array.from({ length: outer }, (_, i) => query(inner + i)),
        ],
      ],
    })

  const result = await localBatchGatewayRequest({
    data: batch(5, 5),
    ccipRequest,
  })
  const error = await localBatchGatewayRequest({
    data: batch(6, 5),
    ccipRequest,
  }).catch((error) => error)

  await server.close()

  const [failures] = decodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: 'query',
    data: result,
  })
  expect(failures).toMatchInlineSnapshot(`
    [
      false,
      false,
      false,
      false,
      false,
      false,
    ]
  `)
  expect(error).toMatchInlineSnapshot(`
    [HttpRequestError: HTTP request failed.

    URL: http://localhost

    Details: CCIP Read exceeded the maximum response size (10485760 bytes).
    Version: viem@x.y.z]
  `)
})
