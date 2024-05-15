import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { dropTransaction } from './dropTransaction.js'
import { mine } from './mine.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

const client = anvilMainnet.getClient()

test('drops transaction', async () => {
  const balance = await getBalance(client, {
    address: sourceAccount.address,
  })
  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('2'),
  })
  await expect(dropTransaction(client, { hash })).resolves.toBeUndefined()
  await mine(client, { blocks: 1 })
  expect(
    await getBalance(client, {
      address: sourceAccount.address,
    }),
  ).not.toBeLessThan(balance)
})
