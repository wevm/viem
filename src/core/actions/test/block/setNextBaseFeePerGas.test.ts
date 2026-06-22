import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, Hex, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('sets the next block base fee', async () => {
  await client.block.setNextBaseFeePerGas({ baseFeePerGas: 1_000_000_000n })
  await client.block.mine({ blocks: 1 })
  const block = await client.request({
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
  })
  expect(
    Hex.toBigInt((block as { baseFeePerGas: Hex.Hex }).baseFeePerGas),
  ).toBe(1_000_000_000n)
})
