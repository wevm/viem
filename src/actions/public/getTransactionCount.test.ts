import { expect, test } from 'vitest'

import { parseEther } from '../../utils/index.js'
import {
  accounts,
  publicClient,
  testClient,
  walletClient,
} from '../../_test/index.js'
import { sendTransaction } from '../index.js'
import { mine, setNonce } from '../test/index.js'
import { getTransactionCount } from './getTransactionCount.js'

test(
  'gets transaction count',
  async () => {
    await setNonce(testClient, { address: accounts[0].address, nonce: 0 })

    expect(
      await getTransactionCount(publicClient, {
        address: accounts[0].address,
      }),
    ).toBe(0)

    await sendTransaction(walletClient, {
      account: accounts[0].address,
      to: accounts[0].address,
      value: parseEther('1'),
    })
    await mine(testClient, { blocks: 1 })

    expect(
      await getTransactionCount(publicClient, {
        address: accounts[0].address,
      }),
    ).toBe(1)
  },
  { retry: 3 },
)

test('args: blockNumber', async () => {
  expect(
    await getTransactionCount(publicClient, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockNumber: 14932234n,
    }),
  ).toBe(368)
})

test('args: blockTag', async () => {
  expect(
    await getTransactionCount(publicClient, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockTag: 'latest',
    }),
  ).toBe(579)
})

test('no count', async () => {
  expect(
    await getTransactionCount(publicClient, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ad',
    }),
  ).toBe(0)
})
