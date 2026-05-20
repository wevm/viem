import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

const address = '0x0000000000000000000000000000000000000201'

describe('setBalance', () => {
  test('behavior: sets account balance', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())

    await actions.setBalance(client, { address, value: 69n })

    expect(await client.public.getBalance({ address })).toMatchInlineSnapshot(
      `69n`,
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

    await actions.setBalance(client, { address, mode: 'hardhat', value: 4n })
    await actions.setBalance(client, { address, mode: 'ganache', value: 4n })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_setBalance",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x4",
          ],
        },
        {
          "method": "evm_setAccountBalance",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x4",
          ],
        },
      ]
    `)
  })
})
