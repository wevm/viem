import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

describe('increaseTime', () => {
  test('behavior: increases the next block timestamp', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())
    const snapshot = await actions.snapshot(client)

    try {
      const before = await client.public.getBlock({ blockTag: 'latest' })

      const offset = await actions.increaseTime(client, { seconds: 2n })
      await actions.mine(client, { blocks: 1n })

      const after = await client.public.getBlock({ blockTag: 'latest' })
      expect({
        offset: typeof offset,
        timestampIncreased: after.timestamp >= before.timestamp + 2n,
      }).toMatchInlineSnapshot(`
        {
          "offset": "bigint",
          "timestampIncreased": true,
        }
      `)
    } finally {
      await actions.revert(client, { id: snapshot })
    }
  })

  test('behavior: serializes seconds as a hex quantity', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
          if (options.method === 'evm_increaseTime') return '0x8'
          return undefined
        },
      }),
    })

    await actions.increaseTime(client, { seconds: 8n })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "evm_increaseTime",
          "params": [
            "0x8",
          ],
        },
      ]
    `)
  })
})
