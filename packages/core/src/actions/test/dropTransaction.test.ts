import { expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../../test'
import { etherToValue } from '../../utils'
import { getBalance } from '../account/getBalance'
import { sendTransaction } from '../transaction/sendTransaction'
import { mine } from './mine'
import { dropTransaction } from './dropTransaction'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('drops transaction', async () => {
  const balance = await getBalance(publicClient, {
    address: sourceAccount.address,
  })
  const { hash } = await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('2'),
    },
  })
  await dropTransaction(testClient, { hash })
  await mine(testClient, { blocks: 1 })
  expect(
    await getBalance(publicClient, {
      address: sourceAccount.address,
    }),
  ).toBe(balance)
})
