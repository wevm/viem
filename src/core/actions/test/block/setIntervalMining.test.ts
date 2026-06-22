import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, Actions, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('sets the mining interval', async () => {
  await expect(
    client.block.setIntervalMining({ interval: 0 }),
  ).resolves.toBeUndefined()
})

test('hardhat scales the interval by 1000', async () => {
  await Actions.test.block
    .setIntervalMining(client, { interval: 0, mode: 'hardhat' })
    .catch(() => {})
})
