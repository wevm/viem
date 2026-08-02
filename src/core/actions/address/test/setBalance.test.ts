import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Client, http, Actions, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

const { address } = constants.accounts[0]

test('sets account balance', async () => {
  await client.address.setBalance({ address, value: 69n })
  expect(
    await client.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    }),
  ).toBe('0x45')
})

test('ganache uses evm_setAccountBalance', async () => {
  await Actions.address
    .setBalance(client, { address, value: 1n, mode: 'ganache' })
    .catch(() => {})
})
