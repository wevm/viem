import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { getBalance } from './getBalance.js'
import { getBlockNumber } from './getBlockNumber.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await mine(testClient, { blocks: 1 })
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
