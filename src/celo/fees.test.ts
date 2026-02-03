import { describe, expect, test, vi } from 'vitest'
import { celo } from '../chains/index.js'
import { createTestClient, http } from '../index.js'

const client = createTestClient({
  transport: http(),
  chain: celo,
  mode: 'anvil',
})

describe('celo/fees', () => {
  const celoEstimateFeesPerGasFn = celo.fees.estimateFeesPerGas
  if (typeof celoEstimateFeesPerGasFn !== 'function') return

  test("doesn't call the client when feeCurrency is not provided", async () => {
    const requestMock = vi.spyOn(client, 'request')

    expect(celo.fees.estimateFeesPerGas).toBeTypeOf('function')

    const fees = await celoEstimateFeesPerGasFn({
      client,
      request: {},
    } as any)

    expect(fees).toBeNull()
    expect(requestMock).not.toHaveBeenCalled()
  })

  test('calls the client when feeCurrency is provided', async () => {
    const requestMock = vi.spyOn(client, 'request')

    const baseFee = 15057755162n
    const priorityFee = 602286n

    expect(celo.fees.estimateFeesPerGas).toBeTypeOf('function')

    // @ts-expect-error
    requestMock.mockImplementation((request: any) => {
      if (request.method === 'eth_gasPrice')
        return (baseFee + priorityFee).toString()
      if (request.method === 'eth_maxPriorityFeePerGas')
        return priorityFee.toString()
      throw new Error(`Unexpected method called: ${request.method}`)
    })

    const multiply = (value: bigint) => (value * 150n) / 100n
    const fees = await celoEstimateFeesPerGasFn({
      client,
      multiply: multiply,
      request: {
        feeCurrency: '0xfee',
      },
    } as any)

    // For Celo L2 the fees maxFeePerGas is calculated as the following where
    // multiply is the method passed to celoEstimateFeesPerGasFn:
    //    `multiply(baseFeePerGas - maxPriorityFeePerGas) + maxPriorityFeePerGas`.
    expect(fees).toMatchInlineSnapshot(`
        {
          "maxFeePerGas": ${multiply(baseFee) + priorityFee}n,
          "maxPriorityFeePerGas": ${priorityFee}n,
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
