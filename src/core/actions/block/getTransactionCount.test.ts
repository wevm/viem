import { expect, test } from 'vitest'
import { Actions } from 'viem'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

test('default', async () => {
  expect(await Actions.block.getTransactionCount(client)).toBeTypeOf('number')
})

test('args: blockNumber', async () => {
  expect(
    await Actions.block.getTransactionCount(client, {
      blockNumber: anvil.mainnet.forkBlockNumber - 1n,
    }),
  ).toBe(165)
})

test('args: blockTag', async () => {
  expect(
    await Actions.block.getTransactionCount(client, { blockTag: 'latest' }),
  ).toBeTypeOf('number')
})

test('args: blockHash', async () => {
  // TODO: replace with `get` action when ported.
  const block = await client.request({
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
  })
  expect(
    await Actions.block.getTransactionCount(client, {
      blockHash: block!.hash!,
    }),
  ).toBeTypeOf('number')
})
