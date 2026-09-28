import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Client, http, Actions, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

const { address } = constants.accounts[0]

test('sets account bytecode', async () => {
  const bytecode = '0x60806040'
  await client.address.setCode({ address, bytecode })
  expect(
    await client.request({
      method: 'eth_getCode',
      params: [address, 'latest'],
    }),
  ).toBe(bytecode)
})

test('ganache uses evm_setAccountCode', async () => {
  await Actions.address
    .setCode(client, { address, bytecode: '0x', mode: 'ganache' })
    .catch(() => {})
})
