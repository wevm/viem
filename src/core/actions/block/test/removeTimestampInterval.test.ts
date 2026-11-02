import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('removes the block timestamp interval', async () => {
  await client.block.setTimestampInterval({ interval: 5 })
  await expect(client.block.removeTimestampInterval()).resolves.toBeUndefined()
})
