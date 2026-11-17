import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('jumps time forward', async () => {
  await expect(
    client.block.increaseTime({ seconds: 86_400 }),
  ).resolves.toBeDefined()
  await client.block.mine({ blocks: 1 })
})
