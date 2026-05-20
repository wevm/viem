import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

describe('removeBlockTimestampInterval', () => {
  test('behavior: removes the block timestamp interval', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())
    const snapshot = await actions.snapshot(client)

    try {
      await actions.setBlockTimestampInterval(client, { interval: 86_400 })
      await actions.mine(client, { blocks: 1n })
      const before = await client.public.getBlock({ blockTag: 'latest' })

      await actions.removeBlockTimestampInterval(client)
      await actions.mine(client, { blocks: 1n })
      const after = await client.public.getBlock({ blockTag: 'latest' })

      expect(
        after.timestamp < before.timestamp + 86_400n,
      ).toMatchInlineSnapshot(`true`)
    } finally {
      await actions.revert(client, { id: snapshot })
    }
  })

  test('behavior: selects hardhat and ganache rpc branches', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
        },
      }),
    })

    await actions.removeBlockTimestampInterval(client, { mode: 'hardhat' })
    await actions.removeBlockTimestampInterval(client, { mode: 'ganache' })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_removeBlockTimestampInterval",
        },
        {
          "method": "ganache_removeBlockTimestampInterval",
        },
      ]
    `)
  })
})
