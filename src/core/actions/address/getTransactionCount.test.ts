import { expect, test } from 'vitest'
import { Actions } from 'viem'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

test('default', async () => {
  expect(
    await Actions.address.getTransactionCount(client, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    }),
  ).toBeTypeOf('number')
})

test('args: blockNumber', async () => {
  expect(
    await Actions.address.getTransactionCount(client, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockNumber: 14932234n,
    }),
  ).toBe(368)
})

test('args: blockTag', async () => {
  expect(
    await Actions.address.getTransactionCount(client, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockTag: 'latest',
    }),
  ).toBeTypeOf('number')
})

test('behavior: no count', async () => {
  expect(
    await Actions.address.getTransactionCount(client, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ad',
    }),
  ).toBe(0)
})

test('args: blockHash (EIP-1898)', async () => {
  const block = await Actions.block.get(client, { blockTag: 'latest' })
  expect(
    await Actions.address.getTransactionCount(client, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockHash: block.hash!,
    }),
  ).toBeTypeOf('number')
})
