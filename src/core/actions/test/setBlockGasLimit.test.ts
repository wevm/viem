import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Client, Hex, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

describe('setBlockGasLimit', () => {
  test('sets the block gas limit', async () => {
    await client.setBlockGasLimit({ gasLimit: 30_000_001n })
    await client.mine({ blocks: 1 })
    const block = await client.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    })
    expect(Hex.toBigInt((block as { gasLimit: Hex.Hex }).gasLimit)).toBe(
      30_000_001n,
    )
  })
})
