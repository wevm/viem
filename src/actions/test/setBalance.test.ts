import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { setBalance } from './setBalance.js'

const client = anvilMainnet.getClient()

const targetAccount = accounts[0]

test('sets balance', async () => {
  await expect(
    setBalance(client, {
      address: targetAccount.address,
      value: parseEther('420'),
    }),
  ).resolves.toBeUndefined()
  expect(
    await getBalance(client, {
      address: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('420000000000000000000n')
  await setBalance(client, {
    address: targetAccount.address,
    value: parseEther('69'),
  })
  expect(
    await getBalance(client, {
      address: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('69000000000000000000n')
})
