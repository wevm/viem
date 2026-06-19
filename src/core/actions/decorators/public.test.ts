import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { publicActions } from './public.js'

describe('publicActions', () => {
  test('decorates a client with public actions', async () => {
    const client = getClient(anvilMainnet).extend(publicActions())
    expect(typeof (await client.getBlockNumber())).toBe('bigint')
    expect(await client.getBlobBaseFee()).toBeTypeOf('bigint')
    expect(await client.getBlockTransactionCount()).toBeTypeOf('number')
    expect(await client.getChainId()).toBe(1)
    expect(
      await client.getCode({
        address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      }),
    ).toMatch(/^0x60/)
    expect(await client.getGasPrice()).toBeTypeOf('bigint')
    expect(
      await client.getStorageAt({
        address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
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
