import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'
import { Hex } from 'viem/utils'

const address = '0x0000000000000000000000000000000000000204'
const value =
  '0x0000000000000000000000000000000000000000000000000000000000000069'

describe('setStorageAt', () => {
  test('behavior: sets account storage', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())
    const slot = 1n

    await actions.setStorageAt(client, { address, slot, value })

    expect(
      await client.public.getStorageAt({
        address,
        slot: Hex.fromNumber(slot),
      }),
    ).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000069"`,
    )
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

    await actions.setStorageAt(client, {
      address,
      mode: 'hardhat',
      slot: 6n,
      value,
    })
    await actions.setStorageAt(client, {
      address,
      mode: 'ganache',
      slot: 6n,
      value,
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_setStorageAt",
          "params": [
            "0x0000000000000000000000000000000000000204",
            "0x6",
            "0x0000000000000000000000000000000000000000000000000000000000000069",
          ],
        },
        {
          "method": "ganache_setStorageAt",
          "params": [
            "0x0000000000000000000000000000000000000204",
            "0x6",
            "0x0000000000000000000000000000000000000000000000000000000000000069",
          ],
        },
      ]
    `)
  })
})
