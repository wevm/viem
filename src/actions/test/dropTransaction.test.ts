import { expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../_test'
import { getAccount, parseEther } from '../../utils'
import { getBalance } from '../public/getBalance'
import { sendTransaction } from '../wallet/sendTransaction'
import { mine } from './mine'
import { dropTransaction } from './dropTransaction'
import { setIntervalMining } from './setIntervalMining'

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
