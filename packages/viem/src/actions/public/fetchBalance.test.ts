import { beforeAll, expect, test } from 'vitest'

import {
  accountProvider,
  accounts,
  initialBlockNumber,
  networkProvider,
  testProvider,
} from '../../../test/utils'
import { numberToHex } from '../../utils'
import { sendTransaction } from '../account/sendTransaction'

import { fetchBalance } from './fetchBalance'
import { fetchBlockNumber } from './fetchBlockNumber'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

beforeAll(async () => {
  await testProvider.request({
    method: 'anvil_setBalance',
    params: [targetAccount.address, numberToHex(targetAccount.balance)],
  })
  await sendTransaction(accountProvider, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: 100000000000000000n,
    },
  })
  await sendTransaction(accountProvider, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: 200000000000000000n,
    },
  })
  await sendTransaction(accountProvider, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: 300000000000000000n,
    },
  })
})

test('fetches balance', async () => {
  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000600000000000000000n')
})

test('fetches balance at latest', async () => {
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockTime: 'latest',
    }),
  ).toMatchInlineSnapshot('10000600000000000000000n')
})

test('fetches balance at block number', async () => {
  const currentBlockNumber = await fetchBlockNumber(networkProvider)
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber,
    }),
  ).toMatchInlineSnapshot('10000600000000000000000n')
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 1,
    }),
  ).toMatchInlineSnapshot('10000300000000000000000n')
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 2,
    }),
  ).toMatchInlineSnapshot('10000100000000000000000n')
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockNumber: initialBlockNumber,
    }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
})
