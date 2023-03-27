import { expect, test } from 'vitest'

import {
  accounts,
  initialBlockNumber,
  publicClient,
  testClient,
  walletClient,
} from '../../_test.js'
import { getAccount, parseEther } from '../../utils/index.js'
import { mine } from '../test.js'
import { sendTransaction } from '...js'
import { getBlock } from './getBlock.js'
import { getBlockTransactionCount } from './getBlockTransactionCount.js'

test('default', async () => {
  expect(await getBlockTransactionCount(publicClient)).toBeDefined()
})

test('args: blockNumber', async () => {
  expect(
    await getBlockTransactionCount(publicClient, {
      blockNumber: initialBlockNumber - 1n,
    }),
  ).toBe(120)
})

test('args: blockHash', async () => {
  const block = await getBlock(publicClient, {
    blockNumber: initialBlockNumber - 1n,
  })
  expect(
    await getBlockTransactionCount(publicClient, {
      blockHash: block.hash!,
    }),
  ).toBe(120)
})

test('args: blockTag', async () => {
  await mine(testClient, { blocks: 1 })
  expect(
    await getBlockTransactionCount(publicClient, {
      blockTag: 'latest',
    }),
  ).toBe(0)
  await sendTransaction(walletClient, {
    account: getAccount(accounts[0].address),
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(testClient, { blocks: 1 })
  expect(
    await getBlockTransactionCount(publicClient, {
      blockTag: 'latest',
    }),
  ).toBe(1)
})
