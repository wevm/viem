import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { getTransactionConfirmations } from './getTransactionConfirmations.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

test('default', async () => {
  const hash = await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(testClient, { blocks: 1 })
  await wait(1000)
  const transactionReceipt = await getTransactionReceipt(publicClient, {
    hash,
  })
  expect(
    await getTransactionConfirmations(publicClient, {
      transactionReceipt,
    }),
  ).toBe(1n)
})

test('multiple confirmations', async () => {
  const hash = await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(testClient, { blocks: 10 })
  const transactionReceipt = await getTransactionReceipt(publicClient, {
    hash,
  })
  expect(
    await getTransactionConfirmations(publicClient, {
      transactionReceipt,
    }),
  ).toBe(10n)
})

test('args: hash', async () => {
  const hash = await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(testClient, { blocks: 10 })
  expect(
    await getTransactionConfirmations(publicClient, {
      hash,
    }),
  ).toBe(10n)
})

test('no confirmations', async () => {
  const hash = await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  expect(
    await getTransactionConfirmations(publicClient, {
      hash,
    }),
  ).toBe(0n)
})
