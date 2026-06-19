import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

describe('setCoinbase', () => {
  test('sets the coinbase', async () => {
    await expect(
      client.setCoinbase({ address: accounts[0].address }),
    ).resolves.toBeUndefined()
  })
})
