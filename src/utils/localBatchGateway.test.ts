import { describe, expect, test } from 'vitest'
import { batchGatewayAbi } from '../constants/abis.js'
import { decodeFunctionResult } from './abi/decodeFunctionResult.js'
import { encodeErrorResult } from './abi/encodeErrorResult.js'
import { encodeFunctionData } from './abi/encodeFunctionData.js'
import { encodeFunctionResult } from './abi/encodeFunctionResult.js'
import { ccipRequest } from './ccip.js'
import { localBatchGateway } from './localBatchGateway.js'

describe('localBatchGateway', () => {
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
        ],
      ],
    })
    const [failures, responses] = decodeFunctionResult({
      abi: batchGatewayAbi,
      functionName: 'query',
      data: await localBatchGateway(data, ccipRequest),
    })
    expect(failures, 'failures').toEqual([false, false, true, true, true])
    expect(responses[0]).toStrictEqual('0x')
    expect(responses[1]).toStrictEqual('0x12345678')
    expect(responses[2]).toStrictEqual(
      encodeErrorResult({
        abi: batchGatewayAbi,
        errorName: 'Error',
        args: ['An unknown error occurred.'],
      }),
    )
    expect(responses[3]).toStrictEqual(
      encodeErrorResult({
        abi: batchGatewayAbi,
        errorName: 'Error',
        args: ['HTTP request failed.'],
      }),
    )
    expect(responses[4]).toStrictEqual(
      encodeErrorResult({
        abi: batchGatewayAbi,
        errorName: 'Error',
        args: [
          'Offchain gateway response is malformed. Response data must be a hex value.',
        ],
      }),
    )
  })
  test('empty', async () => {
    await expect(
      localBatchGateway(
        encodeFunctionData({
          abi: batchGatewayAbi,
          functionName: 'query',
          args: [[]],
        }),
        ccipRequest,
      ),
    ).resolves.toStrictEqual(
      encodeFunctionResult({
        abi: batchGatewayAbi,
        functionName: 'query',
        result: [[], []],
      }),
    )
  })
})
