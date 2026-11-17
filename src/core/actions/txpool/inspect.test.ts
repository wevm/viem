import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('returns pending and queued maps', async () => {
  const txpool = await client.txpool.inspect()
  expect(txpool.pending).toBeDefined()
  expect(txpool.queued).toBeDefined()
})
