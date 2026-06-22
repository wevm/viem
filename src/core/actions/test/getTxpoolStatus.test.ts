import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

describe('getTxpoolStatus', () => {
  test('returns pending and queued counts', async () => {
    const status = await client.getTxpoolStatus()
    expect(typeof status.pending).toBe('number')
    expect(typeof status.queued).toBe('number')
  })
})
