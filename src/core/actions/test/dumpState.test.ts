import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

describe('dumpState', () => {
  test('serializes state', async () => {
    const state = await client.dumpState()
    expect(state.startsWith('0x')).toBe(true)
  })
})
