import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

const address = '0x0000000000000000000000000000000000000203'

describe('setNonce', () => {
  test('behavior: sets account nonce', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())

    await actions.setNonce(client, { address, nonce: 69n })

    expect(
      await client.public.getTransactionCount({ address }),
    ).toMatchInlineSnapshot(`69n`)
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

    await actions.setNonce(client, { address, mode: 'hardhat', nonce: 5n })
    await actions.setNonce(client, { address, mode: 'ganache', nonce: 5n })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_setNonce",
          "params": [
            "0x0000000000000000000000000000000000000203",
            "0x5",
          ],
        },
        {
          "method": "ganache_setNonce",
          "params": [
            "0x0000000000000000000000000000000000000203",
            "0x5",
          ],
        },
      ]
    `)
  })
})
