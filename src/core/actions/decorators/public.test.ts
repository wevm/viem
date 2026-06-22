import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import { describe, expect, test } from 'vitest'

import { publicActions } from './public.js'

const { address } = await contract.deploy(anvil.getClient(anvil.mainnet), {
  bytecode: generated.Erc721.bytecode.object,
})

describe('publicActions', () => {
  test('decorates a client with public actions', async () => {
    const client = anvil.getClient(anvil.mainnet).extend(publicActions())
    expect(
      (
        await client.call({
          data: '0x06fdde03',
          to: address,
        })
      ).data,
    ).toBeDefined()
    expect(await client.estimateMaxPriorityFeePerGas()).toBeTypeOf('bigint')
    expect(
      await client.getBalance({
        address: '0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      }),
    ).toBeTypeOf('bigint')
    expect((await client.getBlock()).number).toBeTypeOf('bigint')
    expect(typeof (await client.getBlockNumber())).toBe('bigint')
    expect(await client.getBlobBaseFee()).toBeTypeOf('bigint')
    expect(await client.getBlockTransactionCount()).toBeTypeOf('number')
    expect(await client.getChainId()).toBe(1)
    expect(
      await client.getCode({
        address,
      }),
    ).toMatch(/^0x60/)
    expect(
      (
        await client.getFeeHistory({
          blockCount: 4,
          rewardPercentiles: [25, 75],
        })
      ).oldestBlock,
    ).toBeTypeOf('bigint')
    expect(await client.getGasPrice()).toBeTypeOf('bigint')
    expect(await client.getLogs({ address })).toBeInstanceOf(Array)
    expect(
      await client.getStorageAt({
        address,
        slot: '0x0',
      }),
    ).toBeDefined()
    expect(
      await client.getTransactionCount({
        address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      }),
    ).toBeTypeOf('number')
  })
})
