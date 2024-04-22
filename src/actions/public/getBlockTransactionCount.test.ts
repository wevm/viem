import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { getBlock } from './getBlock.js'
import { getBlockTransactionCount } from './getBlockTransactionCount.js'

test('default', async () => {
  expect(await getBlockTransactionCount(publicClient)).toBeDefined()
})

test('args: blockNumber', async () => {
  expect(
    await getBlockTransactionCount(publicClient, {
      blockNumber: anvilMainnet.forkBlockNumber - 1n,
    }),
  ).toBe(120)
})

test('args: blockHash', async () => {
  const block = await getBlock(publicClient, {
    blockNumber: anvilMainnet.forkBlockNumber - 1n,
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
    account: accounts[0].address,
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
