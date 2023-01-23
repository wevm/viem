import { describe, expect, test, vi } from 'vitest'

import type { OnTransactionsResponse } from './watchPendingTransactions'
import * as createPendingTransactionFilter from './createPendingTransactionFilter'
import * as getFilterChanges from './getFilterChanges'
import { watchPendingTransactions } from './watchPendingTransactions'
import { accounts, publicClient, testClient, walletClient } from '../../../test'
import { wait } from '../../utils/wait'
import { sendTransaction } from '../wallet'
import { parseEther } from '../../utils'
import { mine, setIntervalMining } from '../test'

test(
  'watches for pending transactions',
  async () => {
    await setIntervalMining(testClient, { interval: 0 })
    await wait(1000)

    let transactions: OnTransactionsResponse = []
    const unwatch = watchPendingTransactions(publicClient, {
      onTransactions: (transactions_) => {
        transactions = [...transactions, ...transactions_]
      },
    })
    await wait(1000)
    await sendTransaction(walletClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
    await wait(1000)
    await sendTransaction(walletClient, {
      from: accounts[2].address,
      to: accounts[3].address,
      value: parseEther('1'),
    })
    await wait(1000)
    unwatch()
    expect(transactions.length).toBe(2)

    await setIntervalMining(testClient, { interval: 1 })
    await mine(testClient, { blocks: 1 })
  },
  { timeout: 10_000 },
)

test('watches for pending transactions (unbatched)', async () => {
  await setIntervalMining(testClient, { interval: 0 })
  await wait(1000)

  let transactions: OnTransactionsResponse = []
  const unwatch = watchPendingTransactions(publicClient, {
    batch: false,
    onTransactions: (transactions_) => {
      transactions = [...transactions, ...transactions_]
    },
  })
  await wait(1000)
  await sendTransaction(walletClient, {
    from: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await wait(1000)
  await sendTransaction(walletClient, {
    from: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await sendTransaction(walletClient, {
    from: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await wait(2000)
  unwatch()
  expect(transactions.length).toBe(3)

  await setIntervalMining(testClient, { interval: 1 })
  await mine(testClient, { blocks: 1 })
})

describe('errors', () => {
  test('handles error thrown from creating filter', async () => {
    vi.spyOn(
      createPendingTransactionFilter,
      'createPendingTransactionFilter',
    ).mockRejectedValueOnce(new Error('foo'))

    let unwatch: () => void = () => null
    const error = await new Promise((resolve) => {
      unwatch = watchPendingTransactions(publicClient, {
        onTransactions: () => null,
        onError: resolve,
      })
    })
    expect(error).toMatchInlineSnapshot('[Error: foo]')
    unwatch()
  })

  test('handles error thrown from filter changes', async () => {
    vi.spyOn(getFilterChanges, 'getFilterChanges').mockRejectedValueOnce(
      new Error('bar'),
    )

    let unwatch: () => void = () => null
    const error = await new Promise((resolve) => {
      unwatch = watchPendingTransactions(publicClient, {
        onTransactions: () => null,
        onError: resolve,
      })
    })
    expect(error).toMatchInlineSnapshot('[Error: bar]')
    unwatch()
  })
})
