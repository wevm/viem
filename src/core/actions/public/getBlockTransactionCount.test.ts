import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { getBlockTransactionCount } from './getBlockTransactionCount.js'

const client = anvil.getClient(anvil.mainnet)

test('default', async () => {
  expect(await getBlockTransactionCount(client)).toBeTypeOf('number')
})

test('args: blockNumber', async () => {
  expect(
    await getBlockTransactionCount(client, {
      blockNumber: anvil.mainnet.forkBlockNumber - 1n,
    }),
  ).toBe(165)
})

test('args: blockTag', async () => {
  expect(
    await getBlockTransactionCount(client, { blockTag: 'latest' }),
  ).toBeTypeOf('number')
})

test('args: blockHash', async () => {
  // TODO: replace with `getBlock` action when ported.
  const block = await client.request({
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
  })
  expect(
    await getBlockTransactionCount(client, { blockHash: block!.hash! }),
  ).toBeTypeOf('number')
})
