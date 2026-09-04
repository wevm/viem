import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'
import { Hex } from 'viem/utils'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('sets the block gas limit', async () => {
  await client.block.setGasLimit({ gasLimit: 30_000_001n })
  await client.block.mine({ blocks: 1 })
  const block = await client.request({
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
  })
  expect(Hex.toBigInt((block as { gasLimit: Hex.Hex }).gasLimit)).toBe(
    30_000_001n,
  )
})
