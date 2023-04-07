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
import { snapshot } from './snapshot.js'
import { revert } from './revert.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('reverts', async () => {
  const balance = await getBalance(publicClient, {
    address: sourceAccount.address,
  })

  const id = await snapshot(testClient)

  await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('2'),
  })
  await mine(testClient, { blocks: 1 })
  expect(
    await getBalance(publicClient, {
      address: sourceAccount.address,
    }),
  ).not.toBe(balance)

  await revert(testClient, { id })
  expect(
    await getBalance(publicClient, {
      address: sourceAccount.address,
    }),
  ).toBe(balance)
})
