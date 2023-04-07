import { expect, test } from 'vitest'

import {
  accounts,
  address,
  publicClient,
  testClient,
} from '../../_test/index.js'
import { parseEther } from '../../utils/index.js'
import { getBalance } from '../public/getBalance.js'
import { mine, setBalance } from './index.js'

import { sendUnsignedTransaction } from './sendUnsignedTransaction.js'

const sourceAccount = {
  address: address.vitalik,
} as const
const targetAccount = accounts[0]

test('sends unsigned transaction', async () => {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await setBalance(testClient, {
    address: sourceAccount.address,
    value: parseEther('10000'),
  })

  const balance = await getBalance(publicClient, {
    address: sourceAccount.address,
  })

  expect(
    await sendUnsignedTransaction(testClient, {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testClient, { blocks: 1 })

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toBeLessThan(balance)
})
