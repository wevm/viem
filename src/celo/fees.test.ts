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

  test('calls the client when feeCurrency is provided celo L1', async () => {
    const requestMock = vi.spyOn(client, 'request')

    const baseFee = 15057755162n
    const priorityFee = 602286n

    expect(celo.fees.estimateFeesPerGas).toBeTypeOf('function')

    // The check to determine if the chain is L1 or L2 is done by checking to
    // see if there is code at the proxy admin address (by calling
    // eth_getCode), if there is code then the chain is considered to be L2. A
    // response of '0x' as used here is what is returned when there is no code
    // at the address.

    // @ts-ignore
    requestMock.mockImplementation((request) => {
      if (request.method === 'eth_gasPrice') return baseFee.toString()
      if (request.method === 'eth_maxPriorityFeePerGas')
        return priorityFee.toString()
      if (request.method === 'eth_getCode') return '0x'
      return
    })

    const fees = await celoestimateFeesPerGasFn({
      client,
      multiply: (value: bigint) => (value * 150n) / 100n,
      request: {
        feeCurrency: '0xfee',
      },
    } as any)

    // For celo L1 the fees maxFeePerGas is calculated as `baseFee + maxPriorityFeePerGas`, the multiply method is not used.
    expect(fees).toMatchInlineSnapshot(`
        {
          "maxFeePerGas": ${baseFee + priorityFee}n,
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

  test('calls the client when feeCurrency is provided celo L2', async () => {
    const requestMock = vi.spyOn(client, 'request')

    const baseFee = 15057755162n
    const priorityFee = 602286n

    expect(celo.fees.estimateFeesPerGas).toBeTypeOf('function')

    // The check to determine if the chain is L1 or L2 is done by checking to
    // see if there is code at the proxy admin address (by calling
    // eth_getCode), if there is code then the chain is considered to be L2. A
    // response longer than '0x' as used here is what is returned when there is
    // code at the address.

    // @ts-ignore
    requestMock.mockImplementation((request) => {
      if (request.method === 'eth_gasPrice')
        return (baseFee + priorityFee).toString()
      if (request.method === 'eth_maxPriorityFeePerGas')
        return priorityFee.toString()
      if (request.method === 'eth_getCode') return '0x00400400404040404040404'
      return
    })

    const multiply = (value: bigint) => (value * 150n) / 100n
    const feesCeloL1 = await celoestimateFeesPerGasFn({
      client,
      multiply: multiply,
      request: {
        feeCurrency: '0xfee',
      },
    } as any)

    // For Celo L2 the fees maxFeePerGas is calculated as the following where
    // multiply is the method passed to celoestimateFeesPerGasFn:
    //    `multiply(baseFeePerGas - maxPriorityFeePerGas) + maxPriorityFeePerGas`.
    expect(feesCeloL1).toMatchInlineSnapshot(`
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
