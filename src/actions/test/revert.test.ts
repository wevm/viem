import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { mine } from './mine.js'
import { revert } from './revert.js'
import { snapshot } from './snapshot.js'

const client = anvilMainnet.getClient()

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('reverts', async () => {
  const balance = await getBalance(client, {
    address: sourceAccount.address,
  })

  const id = await snapshot(client)

  await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('2'),
  })
  await mine(client, { blocks: 1 })
  expect(
    await getBalance(client, {
      address: sourceAccount.address,
    }),
  ).not.toBe(balance)

  await expect(revert(client, { id })).resolves.toBeUndefined()
  expect(
    await getBalance(client, {
      address: sourceAccount.address,
    }),
  ).toBe(balance)
})
