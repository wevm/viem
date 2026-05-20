import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

describe('setNextBlockTimestamp', () => {
  test('behavior: sets the next block timestamp', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())
    const snapshot = await actions.snapshot(client)

    try {
      const before = await client.public.getBlock({ blockTag: 'latest' })
      const timestamp = before.timestamp + 10n

      await actions.setNextBlockTimestamp(client, { timestamp })
      await actions.mine(client, { blocks: 1n })

      const after = await client.public.getBlock({ blockTag: 'latest' })
      expect(after.timestamp).toEqual(timestamp)
    } finally {
      await actions.revert(client, { id: snapshot })
    }
  })

  test('behavior: serializes timestamp as a hex quantity', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
        },
      }),
    })

    await actions.setNextBlockTimestamp(client, { timestamp: 7n })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "evm_setNextBlockTimestamp",
          "params": [
            "0x7",
          ],
        },
      ]
    `)
  })
})
