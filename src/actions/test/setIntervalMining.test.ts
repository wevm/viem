import { describe, expect, test } from 'vp/test'

import { actions, Client, custom } from 'viem'

describe('setIntervalMining', () => {
  test('behavior: hardhat receives milliseconds, ganache receives seconds', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
        },
      }),
    })

    await actions.setIntervalMining(client, { interval: 2, mode: 'hardhat' })
    await actions.setIntervalMining(client, { interval: 2, mode: 'ganache' })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "evm_setIntervalMining",
          "params": [
            2000,
          ],
        },
        {
          "method": "evm_setIntervalMining",
          "params": [
            2,
          ],
        },
      ]
    `)
  })
})
