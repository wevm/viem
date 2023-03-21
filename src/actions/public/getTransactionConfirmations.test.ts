import { expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../_test'
import { parseEther } from '../../utils'
import { mine } from '../test'
import { getTransactionConfirmations } from './getTransactionConfirmations'
import { getTransactionReceipt } from './getTransactionReceipt'
import { sendTransaction } from '..'

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
