import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, http } from 'viem'

describe('snapshot', () => {
  test('behavior: snapshots chain state', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect(await actions.snapshot(client)).toMatch(/^0x[0-9a-f]+$/)
  })
})
