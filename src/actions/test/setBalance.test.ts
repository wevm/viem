import { accounts } from '../../_test/constants.js'
import { publicClient } from '../../_test/utils.js'
import { testClient } from '../../_test/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'
import { setBalance } from './setBalance.js'
import { expect, test } from 'vitest'

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
