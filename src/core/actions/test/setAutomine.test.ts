import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('setAutomine', () => {
  test('enables and disables automine', async () => {
    await client.setAutomine({ enabled: true })
    expect(await client.getAutomine()).toBe(true)
    await client.setAutomine({ enabled: false })
    expect(await client.getAutomine()).toBe(false)
  })

  test('ganache uses miner_start / miner_stop', async () => {
    await Actions.test
      .setAutomine(client, { enabled: true, mode: 'ganache' })
      .catch(() => {})
    await Actions.test
      .setAutomine(client, { enabled: false, mode: 'ganache' })
      .catch(() => {})
  })
})
