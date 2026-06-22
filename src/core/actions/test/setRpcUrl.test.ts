import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('sets the backend RPC url', async () => {
  await expect(
    client.setRpcUrl({ jsonRpcUrl: anvil.mainnet.forkUrl ?? '' }),
  ).resolves.toBeUndefined()
})
