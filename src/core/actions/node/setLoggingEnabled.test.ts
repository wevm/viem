import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('toggles logging', async () => {
  await expect(
    client.node.setLoggingEnabled({ enabled: false }),
  ).resolves.toBeUndefined()
  await client.node.setLoggingEnabled({ enabled: true })
})
