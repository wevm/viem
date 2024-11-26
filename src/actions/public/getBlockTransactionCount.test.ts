import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { getBlock } from './getBlock.js'
import { getBlockTransactionCount } from './getBlockTransactionCount.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  expect(await getBlockTransactionCount(client)).toBeDefined()
})

test('args: blockNumber', async () => {
  expect(
    await getBlockTransactionCount(client, {
      blockNumber: anvilMainnet.forkBlockNumber - 1n,
    }),
  ).toBe(124)
})

test('args: blockHash', async () => {
  const block = await getBlock(client, {
    blockNumber: anvilMainnet.forkBlockNumber - 1n,
  })
  expect(
    await getBlockTransactionCount(client, {
      blockHash: block.hash!,
    }),
  ).toBe(124)
})

test('args: blockTag', async () => {
  await mine(client, { blocks: 1 })
  expect(
    await getBlockTransactionCount(client, {
      blockTag: 'latest',
    }),
  ).toBe(0)
  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 1 })
  expect(
    await getBlockTransactionCount(client, {
      blockTag: 'latest',
    }),
  ).toBe(1)
})
