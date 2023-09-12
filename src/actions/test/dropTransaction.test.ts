import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { dropTransaction } from './dropTransaction.js'
import { mine } from './mine.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('drops transaction', async () => {
  const balance = await getBalance(publicClient, {
    address: sourceAccount.address,
  })
  const hash = await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('2'),
  })
  await expect(dropTransaction(testClient, { hash })).resolves.toBeUndefined()
  await mine(testClient, { blocks: 1 })
  expect(
    await getBalance(publicClient, {
      address: sourceAccount.address,
    }),
  ).not.toBeLessThan(balance)
})
