import { describe, expect, test } from 'vitest'
import { getBlock } from '~viem/actions/public/getBlock.js'
import { createPublicClient, http, type ChainEstimateFeesPerGasFnParameters } from '~viem/index.js'
import { celo } from '../index.js'
import { fees } from "./fees.js"
import { formatters } from './formatters.js'

const client = createPublicClient ({
  transport: http(),
  chain: celo
})

const randomness = {committed: '0x0000000000000000000000000000000000000000000000000000000000000000', revealed: '0x0000000000000000000000000000000000000000000000000000000000000000'} as const

type ChainEstimateParams = ChainEstimateFeesPerGasFnParameters<typeof formatters>

const baseParams = {
        client,
        multiply: (x: bigint) => x * 102n / 100n,
        type: 'eip1559'
      } satisfies Partial<ChainEstimateParams>

describe('celo/fees', () => {
  describe('estimateFeesPerGas()', async () => {
    test('default', async () => {
      const block = await getBlockWithRandomness()
      const params: ChainEstimateParams = {...baseParams, block,  request: { to: '0xto', value: 0n }}
      const { maxFeePerGas, maxPriorityFeePerGas } = await fees.estimateFeesPerGas(params)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
    })

    test('feeCurrency', async () => {
      const block = await getBlockWithRandomness()
      const params: ChainEstimateParams = {
        ...baseParams,
        block: {...block, randomness},
        request: {
          feeCurrency: '0xfeeCurrency'
        }
      }
      expect(fees.estimateFeesPerGas(params)).toEqual({
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0
      })
    })

  })
})


async function getBlockWithRandomness() {
  const block = await getBlock(client, {blockTag: 'pending'})
  console.log("block", block)
  return {...block, randomness}
}

