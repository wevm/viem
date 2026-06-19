import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

const { address } = accounts[0]

describe('setStorageAt', () => {
  test('sets storage with a numeric index', async () => {
    const value =
      '0x0000000000000000000000000000000000000000000000000000000000000045'
    await client.setStorageAt({ address, index: 1, value })
    expect(
      await client.request({
        method: 'eth_getStorageAt',
        params: [address, '0x1', 'latest'],
      }),
    ).toBe(value)
  })

  test('sets storage with a hash index', async () => {
    const index =
      '0x0000000000000000000000000000000000000000000000000000000000000002'
    const value =
      '0x0000000000000000000000000000000000000000000000000000000000000069'
    await client.setStorageAt({ address, index, value })
    expect(
      await client.request({
        method: 'eth_getStorageAt',
        params: [address, index, 'latest'],
      }),
    ).toBe(value)
  })
})
