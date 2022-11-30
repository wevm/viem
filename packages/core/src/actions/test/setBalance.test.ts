import { expect, test } from 'vitest'

import { accounts, networkRpc, testRpc } from '../../../../test/src/utils'
import { etherToValue } from '../../utils'
import { fetchBalance } from '../account'
import { setBalance } from '../test/setBalance'

const targetAccount = accounts[0]

test('sets balance', async () => {
  await setBalance(testRpc, {
    address: targetAccount.address,
    value: etherToValue('420'),
  })
  expect(
    await fetchBalance(networkRpc, {
      address: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('420000000000000000000n')
  await setBalance(testRpc, {
    address: targetAccount.address,
    value: etherToValue('69'),
  })
  expect(
    await fetchBalance(networkRpc, {
      address: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('69000000000000000000n')
})
