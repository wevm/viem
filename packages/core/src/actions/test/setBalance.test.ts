import { expect, test } from 'vitest'

import { accounts, publicClient, testClient } from '../../../test'
import { parseEther } from '../../utils'
import { getBalance } from '../public/getBalance'
import { setBalance } from '../test/setBalance'

const targetAccount = accounts[0]

test('sets balance', async () => {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: parseEther('420'),
  })
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
