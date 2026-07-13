import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, Actions, testActions } from 'viem'
import { Hex } from 'viem/utils'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

const blockNumber = async () =>
  Hex.toNumber(await client.request({ method: 'eth_blockNumber' }))

test('mines blocks', async () => {
  const before = await blockNumber()
  await client.block.mine({ blocks: 3 })
  expect(await blockNumber()).toBe(before + 3)
})

test('mines with an interval', async () => {
  const before = await blockNumber()
  await client.block.mine({ blocks: 1, interval: 1 })
  expect(await blockNumber()).toBe(before + 1)
})

test('ganache uses evm_mine', async () => {
  await Actions.test.block
    .mine(client, { blocks: 1, mode: 'ganache' })
    .catch(() => {})
})
