import { expect, test } from 'vitest'

import { accounts } from '../../_test/constants.js'

import { signMessage } from './signMessage.js'

test('default', async () => {
  expect(
    await signMessage({
      message: 'hello world',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )

  expect(
    await signMessage({
      message: '🥵',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b"',
  )

  expect(
    await signMessage({
      message:
        '0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0x1a7fd732f926be0a1dbfd1b4acbd7a6f7198fda1ab5ef69ef027a2eee89987785d210298e12119a1d62b5a7d2d9f24d075682675ae00f51a5602e725f0d180851b"',
  )
})
