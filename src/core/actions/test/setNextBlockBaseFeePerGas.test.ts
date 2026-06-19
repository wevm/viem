import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, Hex, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('setNextBlockBaseFeePerGas', () => {
  test('sets the next block base fee', async () => {
    await client.setNextBlockBaseFeePerGas({ baseFeePerGas: 1_000_000_000n })
    await client.mine({ blocks: 1 })
    const block = await client.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    })
    expect(
      Hex.toBigInt((block as { baseFeePerGas: Hex.Hex }).baseFeePerGas),
    ).toBe(1_000_000_000n)
  })
})
