import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { mine } from './mine.js'
import { revert } from './revert.js'
import { snapshot } from './snapshot.js'

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

  await expect(revert(testClient, { id })).resolves.toBeUndefined()
  expect(
    await getBalance(publicClient, {
      address: sourceAccount.address,
    }),
  ).toBe(balance)
})
