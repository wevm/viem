import { expect, test } from 'vitest'

import {
  accounts,
  publicClient,
  testClient,
  walletClient,
} from '../../_test/index.js'
import { parseEther } from '../../utils/index.js'
import { getBalance } from '../public/getBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { mine } from './mine.js'
import { dropTransaction } from './dropTransaction.js'
import { setIntervalMining } from './setIntervalMining.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('drops transaction', async () => {
  await setIntervalMining(testClient, { interval: 0 })

  const balance = await getBalance(publicClient, {
    address: sourceAccount.address,
  })
  const hash = await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('2'),
  })
  await dropTransaction(testClient, { hash })
  await mine(testClient, { blocks: 1 })
  expect(
    await getBalance(publicClient, {
      address: sourceAccount.address,
    }),
  ).not.toBeLessThan(balance)

  await setIntervalMining(testClient, { interval: 1 })
})
