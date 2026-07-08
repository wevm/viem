import { AbiError, AbiFunction } from 'ox'
import { createServer } from '~test/http.js'
import { expect, test } from 'vitest'

import { ccipRequest } from '../../internal/ccip.js'
import {
  batchGatewayAbi,
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from './batchGateway.js'

const query = AbiFunction.fromAbi(batchGatewayAbi, 'query')
const httpError = AbiError.fromAbi(batchGatewayAbi, 'HttpError')
const solidityError = AbiError.from('error Error(string message)')

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

  const result = await localBatchGatewayRequest({ ccipRequest, data })

  const [failures, responses] = AbiFunction.decodeResult(query, result)
  expect(failures).toEqual([false, false, true, true, true, false])
  expect(responses[0]).toBe('0x')
  expect(responses[1]).toBe('0x12345678')
  expect(responses[2]).toBe(
    AbiError.encode(solidityError, ['An unknown error occurred.']),
  )
  expect(responses[3]).toBe(
    AbiError.encode(solidityError, ['HTTP request failed.']),
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
      ccipRequest,
      data: AbiFunction.encodeData(query, [[]]),
    }),
  ).resolves.toBe(AbiFunction.encodeResult(query, [[], []]))
})

test('behavior: http error', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: '0x' }))
  })

  const result = await localBatchGatewayRequest({
    ccipRequest,
    data: AbiFunction.encodeData(query, [
      [
        {
          data: '0x',
          sender: '0x0000000000000000000000000000000000000000',
          urls: [server.url],
        },
      ],
    ]),
  })

  const [failures, responses] = AbiFunction.decodeResult(query, result)
  expect(failures).toEqual([true])
  expect(responses[0]).toBe(
    AbiError.encode(httpError, [400, 'HTTP request failed.']),
  )

  await server.close()
})
