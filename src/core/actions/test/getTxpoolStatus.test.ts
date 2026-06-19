import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('getTxpoolStatus', () => {
  test('returns pending and queued counts', async () => {
    const status = await client.getTxpoolStatus()
    expect(typeof status.pending).toBe('number')
    expect(typeof status.queued).toBe('number')
  })
})
