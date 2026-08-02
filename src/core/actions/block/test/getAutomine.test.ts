import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, Actions, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('returns the automine status', async () => {
  await client.block.setAutomine({ enabled: false })
  expect(await client.block.getAutomine()).toBe(false)
})

test('ganache uses eth_mining', async () => {
  await Actions.block.getAutomine(client, { mode: 'ganache' }).catch(() => {})
})
