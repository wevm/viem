import type * as Block from 'ox/Block'
import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { Chain } from 'viem'

import {
  Eip1559FeesNotSupportedError,
  estimateMaxPriorityFeePerGas,
  internal_estimateMaxPriorityFeePerGas,
} from './estimateMaxPriorityFeePerGas.js'

const client = anvil.getClient(anvil.mainnet)

const chain = Chain.from({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
})

describe('estimateMaxPriorityFeePerGas', () => {
  test('default', async () => {
    expect(await estimateMaxPriorityFeePerGas(client)).toBeTypeOf('bigint')
  })

  describe('chain `maxPriorityFeePerGas` override', () => {
    test('value', async () => {
      expect(
        await estimateMaxPriorityFeePerGas(client, {
          chain: { ...chain, fees: { maxPriorityFeePerGas: 69420n } },
        }),
      ).toBe(69420n)
    })

    test('value: zero', async () => {
      expect(
        await estimateMaxPriorityFeePerGas(client, {
          chain: { ...chain, fees: { maxPriorityFeePerGas: 0n } },
        }),
      ).toBe(0n)
    })

    test('sync fn', async () => {
      expect(
        await estimateMaxPriorityFeePerGas(client, {
          chain: { ...chain, fees: { maxPriorityFeePerGas: () => 69420n } },
        }),
      ).toBe(69420n)
    })

    test('async fn', async () => {
      expect(
        await estimateMaxPriorityFeePerGas(client, {
          chain: {
            ...chain,
            fees: { maxPriorityFeePerGas: async () => 69420n },
          },
        }),
      ).toBe(69420n)
    })

    test('null fn falls back to `gasPrice - baseFeePerGas`', async () => {
      expect(
        await estimateMaxPriorityFeePerGas(client, {
          chain: { ...chain, fees: { maxPriorityFeePerGas: async () => null } },
        }),
      ).toBeTypeOf('bigint')
    })
  })

  test('returns 0n when `gasPrice` is below `baseFeePerGas`', async () => {
    expect(
      await internal_estimateMaxPriorityFeePerGas(client, {
        chain: { ...chain, fees: { maxPriorityFeePerGas: () => null } },
        block: { baseFeePerGas: 10n ** 30n } as Block.Block,
      }),
    ).toBe(0n)
  })

  test('error: chain does not support EIP-1559 fees', async () => {
    await expect(
      internal_estimateMaxPriorityFeePerGas(client, {
        chain: { ...chain, fees: { maxPriorityFeePerGas: () => null } },
        block: { baseFeePerGas: undefined } as Block.Block,
      }),
    ).rejects.toThrowError(Eip1559FeesNotSupportedError)
  })
})
