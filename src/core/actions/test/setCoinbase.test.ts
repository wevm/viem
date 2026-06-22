import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

describe('setCoinbase', () => {
  test('sets the coinbase', async () => {
    await expect(
      client.setCoinbase({ address: constants.accounts[0].address }),
    ).resolves.toBeUndefined()
  })
})
