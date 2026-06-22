import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, Actions, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('enables and disables automine', async () => {
  await client.block.setAutomine({ enabled: true })
  expect(await client.block.getAutomine()).toBe(true)
  await client.block.setAutomine({ enabled: false })
  expect(await client.block.getAutomine()).toBe(false)
})

test('ganache uses miner_start / miner_stop', async () => {
  await Actions.test.block
    .setAutomine(client, { enabled: true, mode: 'ganache' })
    .catch(() => {})
  await Actions.test.block
    .setAutomine(client, { enabled: false, mode: 'ganache' })
    .catch(() => {})
})
