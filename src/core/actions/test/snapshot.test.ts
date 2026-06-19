import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('snapshot', () => {
  test('returns a snapshot id', async () => {
    const id = await client.snapshot()
    expect(id.startsWith('0x')).toBe(true)
  })
})
