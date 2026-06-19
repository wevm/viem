import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(testActions())

const { address } = accounts[0]

const balance = async () =>
  client.request({ method: 'eth_getBalance', params: [address, 'latest'] })

describe('revert', () => {
  test('reverts to a snapshot', async () => {
    await client.setBalance({ address, value: 1n })
    const id = await client.snapshot()
    await client.setBalance({ address, value: 2n })
    expect(await balance()).toBe('0x2')
    await client.revert({ id })
    expect(await balance()).toBe('0x1')
  })
})
