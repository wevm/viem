import { beforeAll, expect, test } from 'vitest'

import {
  accountProvider,
  accounts,
  networkProvider,
  testProvider,
} from '../../../test/utils'
import { etherToValue } from '../../utils'
import { sendTransaction } from '../account/sendTransaction'
import { mine } from '../test'
import { setBalance } from '../test/setBalance'

import { fetchBalance } from './fetchBalance'
import { fetchBlockNumber } from './fetchBlockNumber'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

beforeAll(async () => {
  await setBalance(testProvider, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })

  await sendTransaction(accountProvider, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })
  await mine(testProvider, { blocks: 1 })
  await sendTransaction(accountProvider, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('2'),
    },
  })
  await mine(testProvider, { blocks: 1 })
  await sendTransaction(accountProvider, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('3'),
    },
  })
  await mine(testProvider, { blocks: 1 })
})

test('fetches balance', async () => {
  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('fetches balance at latest', async () => {
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockTime: 'latest',
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('fetches balance at block number', async () => {
  const currentBlockNumber = await fetchBlockNumber(networkProvider)
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber,
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 1,
    }),
  ).toMatchInlineSnapshot('10003000000000000000000n')
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 2,
    }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkProvider, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 3,
    }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
})
