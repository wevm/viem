import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'
import { Hex } from 'viem/utils'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('sets the next block timestamp', async () => {
  const timestamp = BigInt(Math.floor(Date.now() / 1000)) + 86_400n
  await client.block.setNextTimestamp({ timestamp })
  await client.block.mine({ blocks: 1 })
  const block = await client.request({
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
  })
  expect(Hex.toBigInt((block as { timestamp: Hex.Hex }).timestamp)).toBe(
    timestamp,
  )
})
