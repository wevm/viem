import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { setNonce } from '../test/setNonce.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getTransactionCount } from './getTransactionCount.js'

const client = anvilMainnet.getClient()

test('gets transaction count', async () => {
  await setNonce(client, { address: accounts[0].address, nonce: 0 })
  await mine(client, { blocks: 1 })

  expect(
    await getTransactionCount(client, {
      address: accounts[0].address,
    }),
  ).toBe(0)

  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[0].address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 1 })

  expect(
    await getTransactionCount(client, {
      address: accounts[0].address,
    }),
  ).toBe(1)
})

test('args: blockNumber', async () => {
  expect(
    await getTransactionCount(client, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockNumber: 14932234n,
    }),
  ).toBe(368)
})

test('args: blockTag', async () => {
  expect(
    await getTransactionCount(client, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      blockTag: 'latest',
    }),
  ).toBe(662)
})

test('no count', async () => {
  expect(
    await getTransactionCount(client, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ad',
    }),
  ).toBe(0)
})
