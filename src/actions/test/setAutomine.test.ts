import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

describe('setAutomine', () => {
  test('behavior: sets automine status', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    await actions.setAutomine(client, true)

    expect(await actions.getAutomine(client)).toMatchInlineSnapshot(`true`)
  })

  test('behavior: selects evm_setAutomine for anvil/hardhat and miner_start/miner_stop for ganache', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
        },
      }),
    })

    await actions.setAutomine(client, true, { mode: 'hardhat' })
    await actions.setAutomine(client, true, { mode: 'ganache' })
    await actions.setAutomine(client, false, { mode: 'ganache' })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "evm_setAutomine",
          "params": [
            true,
          ],
        },
        {
          "method": "miner_start",
        },
        {
          "method": "miner_stop",
        },
      ]
    `)
  })
})
