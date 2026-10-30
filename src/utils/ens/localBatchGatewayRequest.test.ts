import { expect, test } from 'vitest'
import { createHttpServer } from '~test/utils.js'
import { batchGatewayAbi } from '../../constants/abis.js'
import { solidityError } from '../../constants/solidity.js'
import { decodeFunctionResult } from '../abi/decodeFunctionResult.js'
import { encodeErrorResult } from '../abi/encodeErrorResult.js'
import { encodeFunctionData } from '../abi/encodeFunctionData.js'
import { encodeFunctionResult } from '../abi/encodeFunctionResult.js'
import { ccipRequest } from '../ccip.js'
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
