import { expect, test } from 'vitest'

import { accounts, getLocalAccount, walletClient } from '../../_test'
import { getAccount } from '../../utils'
import { signMessage } from './signMessage'

test('default', async () => {
  expect(
    await signMessage(walletClient!, {
      account: getAccount(accounts[0].address),
      message: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )

  expect(
    await signMessage(walletClient!, {
      account: getAccount(accounts[0].address),
      message: '🥵',
    }),
  ).toMatchInlineSnapshot(
    '"0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b"',
  )

  const account = getLocalAccount(accounts[0].privateKey)
  expect(
    await signMessage(walletClient!, {
      account,
      message: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )
})
