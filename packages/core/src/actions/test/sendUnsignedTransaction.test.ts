import { expect, test } from 'vitest'

import { accounts, publicClient, testClient } from '../../../test'
import { parseEther } from '../../utils'
import { getBalance } from '../account'
import { mine, setBalance } from '../test'

import { sendUnsignedTransaction } from './sendUnsignedTransaction'

const sourceAccount = {
  address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
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
    (
      await sendUnsignedTransaction(testClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
        },
      })
    ).hash,
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
