import { describe, expect, test } from 'vitest'

import { batchGatewayAbi } from '../constants/abis.js'
import { decodeFunctionData } from './abi/decodeFunctionData.js'
import { encodeFunctionResult } from './abi/encodeFunctionResult.js'
import { ccipReadTunnel } from './ccipTunnel.js'
import { localBatchGatewayUrl } from './ens/localBatchGatewayRequest.js'

const batchGateways = ['https://ccip-v3.ens.xyz']
const sender = '0x0000000000000000000000000000000000000001'

describe('ccipTunnel', () => {
  test('passthrough', async () => {
    let request: unknown
    const tunnel = ccipReadTunnel({
      batchGateways,
      ccipRequest: async (args) => {
        request = args
        return '0xdeadbeef'
      },
    })

    await expect(
      tunnel.request({
        data: '0xcafebabe',
        sender,
        urls: [localBatchGatewayUrl],
      }),
    ).resolves.toBe('0xdeadbeef')
    expect(request).toStrictEqual({
      data: '0xcafebabe',
      sender,
      urls: batchGateways,
    })
  })

  test('tunnelled', async () => {
    const urls = ['https://example.com/{sender}/{data}']
    let query: unknown
    const tunnel = ccipReadTunnel({
      batchGateways,
      ccipRequest: async (args) => {
        expect(args.sender).toBe(sender)
        expect(args.urls).toStrictEqual(batchGateways)

        const {
          args: [queries],
        } = decodeFunctionData({ abi: batchGatewayAbi, data: args.data })
        query = queries[0]

        return encodeFunctionResult({
          abi: batchGatewayAbi,
          functionName: 'query',
          result: [[false], ['0xdeadbeef']],
        })
      },
    })

    await expect(
      tunnel.request({
        data: '0xcafebabe',
        sender,
        urls,
      }),
    ).resolves.toBe('0xdeadbeef')
    expect(query).toStrictEqual({
      data: '0xcafebabe',
      sender,
      urls,
    })
  })
})
