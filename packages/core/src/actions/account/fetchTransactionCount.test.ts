import { expect, test } from 'vitest'

import { etherToValue } from '../../utils'
import { sendTransaction } from '../transaction'
import { accounts, publicClient, testClient, walletClient } from '../../../test'

import { fetchTransactionCount } from './fetchTransactionCount'
import { mine, setNonce } from '../test'

test('fetches transaction count', async () => {
  await setNonce(testClient, { address: accounts[0].address, nonce: 0 })

  expect(
    await fetchTransactionCount(publicClient, {
      address: accounts[0].address,
    }),
  ).toBe(0)

  await sendTransaction(walletClient, {
    request: {
      from: accounts[0].address,
      to: accounts[0].address,
      value: etherToValue('1'),
    },
  })
  await mine(testClient, { blocks: 1 })

  expect(
    await fetchTransactionCount(publicClient, {
      address: accounts[0].address,
    }),
  ).toBe(1)
})

test('args: blockNumber', async () => {
  expect(
    await fetchTransactionCount(publicClient, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockNumber: 14932234n,
    }),
  ).toBe(368)
})

test('args: blockTag', async () => {
  expect(
    await fetchTransactionCount(publicClient, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockTag: 'latest',
    }),
  ).toBe(476)
})

test('no count', async () => {
  expect(
    await fetchTransactionCount(publicClient, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ad',
    }),
  ).toBe(0)
})
