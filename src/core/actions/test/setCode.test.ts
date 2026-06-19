import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

const { address } = accounts[0]

describe('setCode', () => {
  test('sets account bytecode', async () => {
    const bytecode = '0x60806040'
    await client.setCode({ address, bytecode })
    expect(
      await client.request({
        method: 'eth_getCode',
        params: [address, 'latest'],
      }),
    ).toBe(bytecode)
  })

  test('ganache uses evm_setAccountCode', async () => {
    await Actions.test
      .setCode(client, { address, bytecode: '0x', mode: 'ganache' })
      .catch(() => {})
  })
})
