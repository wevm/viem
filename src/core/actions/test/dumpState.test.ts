import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('serializes state', async () => {
  const state = await client.dumpState()
  expect(state.startsWith('0x')).toBe(true)
})
