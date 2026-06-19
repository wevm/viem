import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { Client, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

const { address } = accounts[0]

describe('setNonce', () => {
  test('sets account nonce', async () => {
    await client.setNonce({ address, nonce: 420 })
    expect(
      await client.request({
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
      }),
    ).toBe('0x1a4')
  })
})
