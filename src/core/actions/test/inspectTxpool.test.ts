import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

describe('inspectTxpool', () => {
  test('returns pending and queued maps', async () => {
    const txpool = await client.inspectTxpool()
    expect(txpool.pending).toBeDefined()
    expect(txpool.queued).toBeDefined()
  })
})
