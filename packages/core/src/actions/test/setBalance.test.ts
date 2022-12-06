import { expect, test } from 'vitest'

import { accounts, publicClient, testClient } from '../../../test'
import { etherToValue } from '../../utils'
import { fetchBalance } from '../account'
import { setBalance } from '../test/setBalance'

const targetAccount = accounts[0]

test('sets balance', async () => {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: etherToValue('420'),
  })
  expect(
    await fetchBalance(publicClient, {
      address: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('420000000000000000000n')
  await setBalance(testClient, {
    address: targetAccount.address,
    value: etherToValue('69'),
  })
  expect(
    await fetchBalance(publicClient, {
      address: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('69000000000000000000n')
})
