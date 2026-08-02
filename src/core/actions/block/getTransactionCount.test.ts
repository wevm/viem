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
  ).toBe(141)
})

test('args: blockTag', async () => {
  expect(
    await Actions.block.getTransactionCount(client, { blockTag: 'latest' }),
  ).toBeTypeOf('number')
})

test('args: blockHash', async () => {
  const block = await Actions.block.get(client, { blockTag: 'latest' })
  expect(
    await Actions.block.getTransactionCount(client, {
      blockHash: block.hash!,
    }),
  ).toBeTypeOf('number')
})
