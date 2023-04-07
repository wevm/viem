import { expect, test } from 'vitest'

import {
  accounts,
  publicClient,
  testClient,
  walletClient,
} from '../../_test/index.js'
import { parseEther } from '../../utils/index.js'
import { getBlockNumber, sendTransaction } from '../index.js'
import { mine, setBalance } from '../test/index.js'

import { getBalance } from './getBalance.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })

  await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  await mine(testClient, { blocks: 1 })
  await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('2'),
  })
  await mine(testClient, { blocks: 1 })
  await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('3'),
  })
  await mine(testClient, { blocks: 1 })
}

test('gets balance', async () => {
  await setup()
  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('gets balance at latest', async () => {
  await setup()
  expect(
    await getBalance(publicClient, {
      address: targetAccount.address,
      blockTag: 'latest',
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('gets balance at block number', async () => {
  await setup()
  const currentBlockNumber = await getBlockNumber(publicClient)
  expect(
    await getBalance(publicClient, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber,
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
  expect(
    await getBalance(publicClient, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 1n,
    }),
  ).toMatchInlineSnapshot('10003000000000000000000n')
  expect(
    await getBalance(publicClient, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 2n,
    }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(publicClient, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 3n,
    }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
})
