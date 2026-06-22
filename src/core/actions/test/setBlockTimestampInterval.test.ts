import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, Actions, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('sets the block timestamp interval', async () => {
  await expect(
    client.setBlockTimestampInterval({ interval: 5 }),
  ).resolves.toBeUndefined()
  await client.removeBlockTimestampInterval()
})

test('hardhat scales the interval by 1000', async () => {
  await Actions.test
    .setBlockTimestampInterval(client, { interval: 1, mode: 'hardhat' })
    .catch(() => {})
  await client.removeBlockTimestampInterval()
})
