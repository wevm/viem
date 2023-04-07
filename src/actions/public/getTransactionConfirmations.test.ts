import { expect, test } from 'vitest'

import {
  accounts,
  publicClient,
  testClient,
  walletClient,
} from '../../_test/index.js'
import { parseEther } from '../../utils/index.js'
import { mine } from '../test/index.js'
import { getTransactionConfirmations } from './getTransactionConfirmations.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'
import { sendTransaction } from '../index.js'

test('default', async () => {
  const hash = await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await mine(testClient, { blocks: 1 })
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
