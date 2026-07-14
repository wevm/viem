import type { IncomingMessage } from 'node:http'
import { Abi, AbiError, AbiFunction, Hex } from 'ox'
import { createServer } from '~test/http.js'
import { expect, test } from 'vitest'

import { CcipRead } from 'viem/utils'
import { withResolvers } from '../../../internal/promise.js'
import {
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from './batchGateway.js'

const batchGatewayAbi = Abi.from([
  'function query((address sender, string[] urls, bytes data)[] queries) view returns (bool[] failures, bytes[] responses)',
  'error HttpError(uint16 status, string message)',
])
const query = AbiFunction.fromAbi(batchGatewayAbi, 'query')
const httpError = AbiError.fromAbi(batchGatewayAbi, 'HttpError')
const solidityError = AbiError.from('error Error(string message)')
const unsafeRequest: CcipRead.Request = (options) =>
  CcipRead.request({ ...options, allowUnsafeUrls: true })

test('default', async () => {
  const sender = '0x0000000000000000000000000000000000000001'
  const data = AbiFunction.encodeData(query, [
    [
      { data: '0x', sender, urls: ['data:application/json,{"data":"0x"}'] },
      {
        data: '0x',
        sender,
        urls: ['data:application/json,{"data":"0x12345678"}'],
      },
      // No urls.
      { data: '0x', sender, urls: [] },
      // Invalid url.
      { data: '0x', sender, urls: ['_'] },
      // Malformed (non-hex) response.
      { data: '0x', sender, urls: ['data:text/plain,chonk'] },
      // Recursion through the local batch gateway.
      {
        data: AbiFunction.encodeData(query, [
          [
            {
              data: '0x',
              sender,
              urls: ['data:application/json,{"data":"0xabcdef"}'],
            },
          ],
        ]),
        sender,
        urls: [localBatchGatewayUrl],
      },
    ],
  ])

  const result = await localBatchGatewayRequest({
    data,
    request: unsafeRequest,
  })

  const [failures, responses] = AbiFunction.decodeResult(query, result)
  expect(failures).toEqual([false, false, true, true, true, false])
  expect(responses[0]).toBe('0x')
  expect(responses[1]).toBe('0x12345678')
  expect(responses[2]).toBe(
    AbiError.encode(solidityError, ['An unknown error occurred.']),
  )
  expect(responses[3]).toBe(
    AbiError.encode(solidityError, [
      'CCIP gateway URL is not allowed. Only standard-port HTTPS hostnames are permitted.',
    ]),
  )
  expect(responses[4]).toBe(
    AbiError.encode(solidityError, [
      'Offchain gateway response is malformed. Response data must be a hex value.',
    ]),
  )
  expect(responses[5]).toBe(
    AbiFunction.encodeResult(query, [[false], ['0xabcdef']]),
  )
})

test('behavior: empty', async () => {
  await expect(
    localBatchGatewayRequest({
      data: AbiFunction.encodeData(query, [[]]),
      request: unsafeRequest,
    }),
  ).resolves.toBe(AbiFunction.encodeResult(query, [[], []]))
})

test('behavior: http error', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: '0x' }))
  })

  const result = await localBatchGatewayRequest({
    data: AbiFunction.encodeData(query, [
      [
        {
          data: '0x',
          sender: '0x0000000000000000000000000000000000000000',
          urls: [server.url],
        },
      ],
    ]),
    request: unsafeRequest,
  })

  const [failures, responses] = AbiFunction.decodeResult(query, result)
  expect(failures).toEqual([true])
  expect(responses[0]).toBe(
    AbiError.encode(httpError, [400, 'HTTP request failed.']),
  )

  await server.close()
})

test('behavior: limits nested local batches', async () => {
  const sender = '0x0000000000000000000000000000000000000001'
  let data: Hex.Hex = '0x'
  for (let depth = 0; depth < 4; depth++)
    data = AbiFunction.encodeData(query, [
      [{ data, sender, urls: [localBatchGatewayUrl] }],
    ])

  let result = await localBatchGatewayRequest({
    data,
    request: unsafeRequest,
  })

  for (let depth = 0; depth < 3; depth++) {
    const [failures, responses] = AbiFunction.decodeResult(query, result)
    expect(failures).toEqual([false])
    result = responses[0]!
  }

  const [failures, responses] = AbiFunction.decodeResult(query, result)
  expect(failures).toEqual([true])
  expect(responses[0]).toBe(
    AbiError.encode(solidityError, [
      'CCIP batch gateway nesting limit exceeded.',
    ]),
  )
})

test('behavior: limits total nested queries', async () => {
  const sender = '0x0000000000000000000000000000000000000001'
  const nested = AbiFunction.encodeData(query, [
    Array.from(
      { length: 64 },
      () =>
        ({
          data: '0x',
          sender,
          urls: ['data:application/json,{"data":"0x"}'],
        }) as const,
    ),
  ])
  const data = AbiFunction.encodeData(query, [
    [{ data: nested, sender, urls: [localBatchGatewayUrl] }],
  ])

  const result = await localBatchGatewayRequest({
    data,
    request: unsafeRequest,
  })

  const [failures, responses] = AbiFunction.decodeResult(query, result)
  expect(failures).toEqual([true])
  expect(responses[0]).toBe(
    AbiError.encode(solidityError, [
      'CCIP batch gateway query limit exceeded.',
    ]),
  )
})

test('behavior: limits concurrent requests', async () => {
  const active = new Set<IncomingMessage>()
  const barrier = withResolvers<void>()
  const server = await createServer(async (request, response) => {
    active.add(request)
    if (active.size === 4) barrier.resolve()
    await barrier.promise
    await new Promise((resolve) => setTimeout(resolve, 20))
    const data = Hex.fromNumber(active.size, { size: 1 })
    active.delete(request)
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ data }))
  })
  const sender = '0x0000000000000000000000000000000000000001'
  const data = AbiFunction.encodeData(query, [
    Array.from(
      { length: 8 },
      () =>
        ({
          data: '0x',
          sender,
          urls: [server.url],
        }) as const,
    ),
  ])

  try {
    const result = await localBatchGatewayRequest({
      data,
      request: unsafeRequest,
    })
    const [failures, responses] = AbiFunction.decodeResult(query, result)

    expect({
      failures,
      maxConcurrency: Math.max(
        ...responses.map((response) => Hex.toNumber(response)),
      ),
    }).toMatchInlineSnapshot(`
      {
        "failures": [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        "maxConcurrency": 4,
      }
    `)
  } finally {
    await server.close()
  }
})
