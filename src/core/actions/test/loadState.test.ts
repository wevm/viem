import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

describe('loadState', () => {
  test('loads a dumped state', async () => {
    const state = await client.dumpState()
    await expect(client.loadState({ state })).resolves.toBeUndefined()
  })
})
