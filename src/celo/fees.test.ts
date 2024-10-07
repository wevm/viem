import { describe, expect, test, vi } from 'vitest'
import { celo } from '~viem/chains/index.js'
import { http, createTestClient } from '~viem/index.js'

const client = createTestClient({
  transport: http(),
  chain: celo,
  mode: 'anvil',
})

describe('celo/fees', () => {
  const celoestimateFeesPerGasFn = celo.fees.estimateFeesPerGas
  if (typeof celoestimateFeesPerGasFn !== 'function') return

  test("doesn't call the client when feeCurrency is not provided", async () => {
    const requestMock = vi.spyOn(client, 'request')

    expect(celo.fees.estimateFeesPerGas).toBeTypeOf('function')

    const fees = await celoestimateFeesPerGasFn({
      client,
      request: {},
    } as any)

    expect(fees).toBeNull()
    expect(requestMock).not.toHaveBeenCalled()
  })

  test('calls the client when feeCurrency is provided', async () => {
    const requestMock = vi.spyOn(client, 'request')
    // @ts-ignore
    requestMock.mockImplementation((request) => {
      if (request.method === 'eth_gasPrice') return '15057755162'
      if (request.method === 'eth_maxPriorityFeePerGas') return '602286'
      return
    })

    expect(celo.fees.estimateFeesPerGas).toBeTypeOf('function')

    const fees = await celoestimateFeesPerGasFn({
      client,
      multiply: (value: bigint) => (value * 150n) / 100n,
      request: {
        feeCurrency: '0xfee',
      },
    } as any)

    expect(fees).toMatchInlineSnapshot(`
        {
          "maxFeePerGas": 22587235029n,
          "maxPriorityFeePerGas": 602286n,
        }
      `)
    expect(requestMock).toHaveBeenCalledWith({
      method: 'eth_maxPriorityFeePerGas',
      params: ['0xfee'],
    })
    expect(requestMock).toHaveBeenCalledWith({
      method: 'eth_gasPrice',
      params: ['0xfee'],
    })
  })
})
