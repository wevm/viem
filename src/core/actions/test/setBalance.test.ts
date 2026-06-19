import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

const { address } = accounts[0]

describe('setBalance', () => {
  test('sets account balance', async () => {
    await client.setBalance({ address, value: 69n })
    expect(
      await client.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    ).toBe('0x45')
  })

  test('ganache uses evm_setAccountBalance', async () => {
    await Actions.test
      .setBalance(client, { address, value: 1n, mode: 'ganache' })
      .catch(() => {})
  })
})
