import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

const { address } = constants.accounts[0]

test('sets account nonce', async () => {
  await client.address.setNonce({ address, nonce: 420 })
  expect(
    await client.request({
      method: 'eth_getTransactionCount',
      params: [address, 'latest'],
    }),
  ).toBe('0x1a4')
})
