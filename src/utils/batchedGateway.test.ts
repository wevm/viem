import { describe, expect, test } from 'vitest'
import { batchedGateway } from './batchedGateway.js'
import { ccipRequest } from './ccip.js'
import { batchedGatewayAbi } from '~viem/constants/abis.js'
import { encodeFunctionData } from './abi/encodeFunctionData.js'
import { decodeFunctionResult } from './abi/decodeFunctionResult.js'
import { encodeErrorResult } from './abi/encodeErrorResult.js'

describe('offchainLookup', () => {
  test('default', async () => {
    const sender = '0x0000000000000000000000000000000000000001'
    const data = encodeFunctionData({
      abi: batchedGatewayAbi,
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
            urls: [],
          },
          {
            sender,
            data: '0x',
            urls: ['_invalid://url'],
          },
        ],
      ],
    })
    const [failures, responses] = decodeFunctionResult({
      abi: batchedGatewayAbi,
      functionName: 'query',
      data: await batchedGateway(data, ccipRequest),
    })
    expect(failures, 'failures').toBe([false, false, true])
    expect(responses[0]).toStrictEqual('0x')
    expect(responses[1]).toStrictEqual('0x12345678')
    const fetchError = encodeErrorResult({
      abi: batchedGatewayAbi,
      errorName: 'HttpError',
      args: [500, 'An unknown error occurred.'],
    })
    expect(responses[2]).toStrictEqual(fetchError)
    expect(responses[3]).toStrictEqual(fetchError)
  })
})
