import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

describe('getAutomine', () => {
  test('behavior: returns automine status', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect(await actions.getAutomine(client)).toMatchInlineSnapshot(`true`)
  })

  test('behavior: selects hardhat_getAutomine for hardhat and eth_mining for ganache', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
          if (options.method === 'hardhat_getAutomine') return true
          if (options.method === 'eth_mining') return true
          return undefined
        },
      }),
    })

    await actions.getAutomine(client, { mode: 'hardhat' })
    await actions.getAutomine(client, { mode: 'ganache' })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_getAutomine",
        },
        {
          "method": "eth_mining",
        },
      ]
    `)
  })
})
