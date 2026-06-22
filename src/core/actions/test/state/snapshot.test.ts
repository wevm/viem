import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('returns a snapshot id', async () => {
  const id = await client.state.snapshot()
  expect(id.startsWith('0x')).toBe(true)
})
