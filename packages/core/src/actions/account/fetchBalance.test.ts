import { expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../../test'
import { etherToValue } from '../../utils'
import { fetchBlockNumber } from '../block'
import { sendTransaction } from '../transaction'
import { mine, setBalance } from '../test'

import { fetchBalance } from './fetchBalance'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })

  await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })
  await mine(testClient, { blocks: 1 })
  await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('2'),
    },
  })
  await mine(testClient, { blocks: 1 })
  await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('3'),
    },
  })
  await mine(testClient, { blocks: 1 })
}

test('fetches balance', async () => {
  await setup()
  expect(
    await fetchBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('fetches balance at latest', async () => {
  await setup()
  expect(
    await fetchBalance(publicClient, {
      address: targetAccount.address,
      blockTag: 'latest',
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('fetches balance at block number', async () => {
  await setup()
  const currentBlockNumber = await fetchBlockNumber(publicClient)
  expect(
    await fetchBalance(publicClient, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber,
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
  expect(
    await fetchBalance(publicClient, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 1,
    }),
  ).toMatchInlineSnapshot('10003000000000000000000n')
  expect(
    await fetchBalance(publicClient, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 2,
    }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(publicClient, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 3,
    }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
})
