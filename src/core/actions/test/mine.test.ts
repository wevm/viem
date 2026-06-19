import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { Client, Hex, http, Actions } from 'viem'

const client = Client.create({
  transport: http(anvilMainnet.rpcUrl.http),
}).extend(Actions.testActions())

const blockNumber = async () =>
  Hex.toNumber(await client.request({ method: 'eth_blockNumber' }))

describe('mine', () => {
  test('mines blocks', async () => {
    const before = await blockNumber()
    await client.mine({ blocks: 3 })
    expect(await blockNumber()).toBe(before + 3)
  })

  test('mines with an interval', async () => {
    const before = await blockNumber()
    await client.mine({ blocks: 1, interval: 1 })
    expect(await blockNumber()).toBe(before + 1)
  })

  test('ganache uses evm_mine', async () => {
    await Actions.test
      .mine(client, { blocks: 1, mode: 'ganache' })
      .catch(() => {})
  })
})
