import { describe, expect, test } from 'vitest'

import * as constants from '~test/constants.js'
import { PersonalMessage, Secp256k1 } from 'viem'

const account = constants.accounts[0].address
const publicKey = Secp256k1.getPublicKey({
  privateKey: constants.accounts[0].privateKey,
})

describe('recoverAddress', () => {
  test('default', () => {
    expect(
      PersonalMessage.recoverAddress({
        message: 'hello world',
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toEqual(account)

    expect(
      PersonalMessage.recoverAddress({
        message: '🥵',
        signature:
          '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
      }),
    ).toEqual(account)
  })

  test('args: raw message', () => {
    expect(
      PersonalMessage.recoverAddress({
        message: { raw: '0x68656c6c6f20776f726c64' },
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toEqual(account)

    expect(
      PersonalMessage.recoverAddress({
        message: {
          raw: Uint8Array.from([
            104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
          ]),
        },
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toEqual(account)
  })
})

describe('verify', () => {
  test('default', () => {
    expect(
      PersonalMessage.verify({
        publicKey,
        message: 'hello world',
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(true)

    expect(
      PersonalMessage.verify({
        publicKey,
        message: { raw: '0x68656c6c6f20776f726c64' },
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(true)
  })

  test('args: address', () => {
    expect(
      PersonalMessage.verify({
        address: account,
        message: 'hello world',
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(true)

    expect(
      PersonalMessage.verify({
        address: constants.accounts[1].address,
        message: 'hello world',
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(false)
  })

  test('behavior: mismatched message', () => {
    expect(
      PersonalMessage.verify({
        publicKey,
        message: 'wagmi',
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(false)
  })

  test('behavior: mismatched public key', () => {
    expect(
      PersonalMessage.verify({
        publicKey: Secp256k1.getPublicKey({
          privateKey: constants.accounts[1].privateKey,
        }),
        message: 'hello world',
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(false)
  })
})
