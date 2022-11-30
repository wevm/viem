import { expect, test } from 'vitest'

import { accounts, networkRpc, testRpc, walletRpc } from '../../../../test/src'
import { etherToValue } from '../../utils'
import { fetchBlockNumber } from '../block'
import { sendTransaction } from '../transaction'
import { mine, setBalance } from '../test'

import { fetchBalance } from './fetchBalance'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(testRpc, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })

  await sendTransaction(walletRpc, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })
  await mine(testRpc, { blocks: 1 })
  await sendTransaction(walletRpc, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('2'),
    },
  })
  await mine(testRpc, { blocks: 1 })
  await sendTransaction(walletRpc, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('3'),
    },
  })
  await mine(testRpc, { blocks: 1 })
}

test('fetches balance', async () => {
  await setup()
  expect(
    await fetchBalance(networkRpc, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('fetches balance at latest', async () => {
  await setup()
  expect(
    await fetchBalance(networkRpc, {
      address: targetAccount.address,
      blockTag: 'latest',
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
})

test('fetches balance at block number', async () => {
  await setup()
  const currentBlockNumber = await fetchBlockNumber(networkRpc)
  expect(
    await fetchBalance(networkRpc, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber,
    }),
  ).toMatchInlineSnapshot('10006000000000000000000n')
  expect(
    await fetchBalance(networkRpc, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 1,
    }),
  ).toMatchInlineSnapshot('10003000000000000000000n')
  expect(
    await fetchBalance(networkRpc, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 2,
    }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkRpc, {
      address: targetAccount.address,
      blockNumber: currentBlockNumber - 3,
    }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
})
