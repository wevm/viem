import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

describe('setBlockTimestampInterval', () => {
  test('behavior: sets the block timestamp interval', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())
    const snapshot = await actions.snapshot(client)

    try {
      await actions.setBlockTimestampInterval(client, { interval: 7 })
      await actions.mine(client, { blocks: 1n })
      const first = await client.public.getBlock({ blockTag: 'latest' })

      await actions.mine(client, { blocks: 1n })
      const second = await client.public.getBlock({ blockTag: 'latest' })

      expect(second.timestamp - first.timestamp).toMatchInlineSnapshot(`7n`)
    } finally {
      await actions.removeBlockTimestampInterval(client)
      await actions.revert(client, { id: snapshot })
    }
  })

  test('behavior: hardhat receives milliseconds, ganache receives seconds', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
        },
      }),
    })

    await actions.setBlockTimestampInterval(client, {
      interval: 2,
      mode: 'hardhat',
    })
    await actions.setBlockTimestampInterval(client, {
      interval: 2,
      mode: 'ganache',
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_setBlockTimestampInterval",
          "params": [
            2000,
          ],
        },
        {
          "method": "ganache_setBlockTimestampInterval",
          "params": [
            2,
          ],
        },
      ]
    `)
  })
})
