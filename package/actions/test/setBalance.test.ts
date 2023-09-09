import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient, testClient } from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'

import { setBalance } from './setBalance.js'

const targetAccount = accounts[0]

test('sets balance', async () => {
  await expect(
    setBalance(testClient, {
      address: targetAccount.address,
      value: parseEther('420'),
    }),
  ).resolves.toBeUndefined()
  expect(
    await getBalance(publicClient, {
      address: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('420000000000000000000n')
  await setBalance(testClient, {
    address: targetAccount.address,
    value: parseEther('69'),
  })
  expect(
    await getBalance(publicClient, {
      address: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('69000000000000000000n')
})
