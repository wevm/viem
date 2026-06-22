import type * as Block from 'ox/Block'
import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { Chain } from 'viem'

import {
  BaseFeeScalarError,
  estimateFeesPerGas,
  internal_estimateFeesPerGas,
} from './estimateFeesPerGas.js'
import { Eip1559FeesNotSupportedError } from './estimateMaxPriorityFeePerGas.js'

const client = anvil.getClient(anvil.mainnet)

const chain = Chain.from({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
})

test('default: eip1559', async () => {
  const { maxFeePerGas, maxPriorityFeePerGas } =
    await estimateFeesPerGas(client)
  expect(maxFeePerGas).toBeTypeOf('bigint')
  expect(maxPriorityFeePerGas).toBeTypeOf('bigint')
})

test('type: legacy', async () => {
  const { gasPrice } = await estimateFeesPerGas(client, { type: 'legacy' })
  expect(gasPrice).toBeTypeOf('bigint')
})

describe('chain `estimateFeesPerGas` override', () => {
  test('returns value', async () => {
    expect(
      await estimateFeesPerGas(client, {
        chain: {
          ...chain,
          fees: {
            estimateFeesPerGas: async () => ({
              maxFeePerGas: 1n,
              maxPriorityFeePerGas: 2n,
            }),
          },
        },
      }),
    ).toEqual({ maxFeePerGas: 1n, maxPriorityFeePerGas: 2n })
  })

  test('null falls back to default estimation', async () => {
    const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
      client,
      {
        chain: {
          ...chain,
          fees: { estimateFeesPerGas: async () => null },
        },
      },
    )
    expect(maxFeePerGas).toBeTypeOf('bigint')
    expect(maxPriorityFeePerGas).toBeTypeOf('bigint')
  })
})

describe('chain `baseFeeMultiplier` override', () => {
  test('value (integer)', async () => {
    const { maxFeePerGas } = await estimateFeesPerGas(client, {
      chain: { ...chain, fees: { baseFeeMultiplier: 2 } },
    })
    expect(maxFeePerGas).toBeTypeOf('bigint')
  })

  test('async fn', async () => {
    const { maxFeePerGas } = await estimateFeesPerGas(client, {
      chain: { ...chain, fees: { baseFeeMultiplier: async () => 1.5 } },
    })
    expect(maxFeePerGas).toBeTypeOf('bigint')
  })

  test('error: value below 1', async () => {
    await expect(() =>
      estimateFeesPerGas(client, {
        chain: { ...chain, fees: { baseFeeMultiplier: 0.5 } },
      }),
    ).rejects.toThrowError(BaseFeeScalarError)
  })

  test('error: fn returns below 1', async () => {
    await expect(() =>
      estimateFeesPerGas(client, {
        chain: { ...chain, fees: { baseFeeMultiplier: async () => 0.5 } },
      }),
    ).rejects.toThrowError(BaseFeeScalarError)
  })
})

test('error: chain does not support EIP-1559 fees', async () => {
  await expect(() =>
    internal_estimateFeesPerGas(client, {
      block: { baseFeePerGas: undefined } as Block.Block,
    }),
  ).rejects.toThrowError(Eip1559FeesNotSupportedError)
})
