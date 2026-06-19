import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

describe('setIntervalMining', () => {
  test('sets the mining interval', async () => {
    await expect(
      client.setIntervalMining({ interval: 0 }),
    ).resolves.toBeUndefined()
  })

  test('hardhat scales the interval by 1000', async () => {
    await Actions.test
      .setIntervalMining(client, { interval: 0, mode: 'hardhat' })
      .catch(() => {})
  })
})
