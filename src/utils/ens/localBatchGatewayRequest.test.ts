import { expect, test, vi } from 'vitest'
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
  const data = encodeFunctionData({
    abi: batchGatewayAbi,
    functionName: 'query',
    args: [
      [
        {
          sender,
          data: '0x',
          urls: ['data:application/json,{"data":"0x"}'],
        },
        {
          sender,
          data: '0x',
          urls: ['data:application/json,{"data":"0x12345678"}'],
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
          urls: ['data:text/plain,chonk'], // OffchainLookupResponseMalformedError
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
                  urls: ['data:application/json,{"data":"0xabcdef"}'],
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
  vi.spyOn(global, 'fetch').mockResolvedValue({
    headers: new Headers(),
    ok: false,
    status: 400,
    json: vi.fn().mockResolvedValue({
      data: '0x',
    }),
    text: vi.fn().mockResolvedValue('0x'),
  } as any)

  const data = await localBatchGatewayRequest({
    data: encodeFunctionData({
      abi: batchGatewayAbi,
      functionName: 'query',
      args: [
        [
          {
            sender: '0x0000000000000000000000000000000000000000',
            data: '0x',
            urls: ['data:application/json,{"data":"0x"}'],
          },
        ],
      ],
    }),
    ccipRequest,
  })

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
