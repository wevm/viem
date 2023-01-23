import { expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../../test'
import { parseEther } from '../../utils'
import { getBalance } from '../public/getBalance'
import { sendTransaction } from '../wallet/sendTransaction'
import { mine } from './mine'
import { snapshot } from './snapshot'
import { revert } from './revert'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('reverts', async () => {
  const balance = await getBalance(publicClient, {
    address: sourceAccount.address,
  })

  const id = await snapshot(testClient)

  await sendTransaction(walletClient, {
    from: sourceAccount.address,
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
