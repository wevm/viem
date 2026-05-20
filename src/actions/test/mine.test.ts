import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { actions, Client, custom, http } from 'viem'

describe('mine', () => {
  test('behavior: mines blocks', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())

    const before = await client.public.getBlockNumber({ cacheTime: 0 })
    await actions.mine(client, { blocks: 2n })
    const after = await client.public.getBlockNumber({ cacheTime: 0 })

    expect(after - before).toMatchInlineSnapshot(`2n`)
  })

  test('behavior: mines blocks with interval', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(actions.publicActions())

    const before = await client.public.getBlock({ blockTag: 'latest' })
    await actions.mine(client, { blocks: 1n, interval: 12n })
    const after = await client.public.getBlock({ blockTag: 'latest' })

    expect(after.timestamp >= before.timestamp + 12n).toMatchInlineSnapshot(
      `true`,
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

    await actions.mine(client, { blocks: 2n, interval: 3n, mode: 'hardhat' })
    await actions.mine(client, { blocks: 2n, interval: 3n, mode: 'ganache' })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_mine",
          "params": [
            "0x2",
            "0x3",
          ],
        },
        {
          "method": "evm_mine",
          "params": [
            {
              "blocks": "0x2",
            },
          ],
        },
      ]
    `)
  })
})
