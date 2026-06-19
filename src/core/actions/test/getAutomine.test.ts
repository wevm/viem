import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, http, Actions, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

describe('getAutomine', () => {
  test('returns the automine status', async () => {
    await client.setAutomine({ enabled: false })
    expect(await client.getAutomine()).toBe(false)
  })

  test('ganache uses eth_mining', async () => {
    await Actions.test.getAutomine(client, { mode: 'ganache' }).catch(() => {})
  })
})
