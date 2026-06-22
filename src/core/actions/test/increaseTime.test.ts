import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('jumps time forward', async () => {
  await expect(client.increaseTime({ seconds: 86_400 })).resolves.toBeDefined()
  await client.mine({ blocks: 1 })
})
