import { expect, test } from 'vitest'

import { accounts, getLocalAccount, walletClient } from '../../_test'
import { getAccount } from '../../utils'
import { signMessage } from './signMessage'

test('default', async () => {
  expect(
    await signMessage(walletClient!, {
      account: getAccount(accounts[0].address),
      data: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )

  const account = getLocalAccount(accounts[0].privateKey)
  expect(
    await signMessage(walletClient!, {
      account,
      data: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )
})
