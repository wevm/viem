import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

test('sets the coinbase', async () => {
  await expect(
    client.block.setCoinbase({ address: constants.accounts[0].address }),
  ).resolves.toBeUndefined()
})
