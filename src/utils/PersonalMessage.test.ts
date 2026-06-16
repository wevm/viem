import * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'
import * as P256 from 'ox/P256'
import * as WebCryptoP256 from 'ox/WebCryptoP256'
import { describe, expect, test } from 'vitest'

import { accounts } from '~test/constants.js'
import { getWebAuthnPublicKey, signWebAuthn } from '~test/webauthn.js'
import * as Curve from '../core/Curve.js'
import * as PersonalMessage from './PersonalMessage.js'
import * as Secp256k1 from './Secp256k1.js'

const account = accounts[0].address
const publicKey = Secp256k1.getPublicKey({
  privateKey: accounts[0].privateKey,
})

const p256PrivateKey = P256.randomPrivateKey()

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
        curve: Curve.secp256k1(),
        message: { raw: '0x68656c6c6f20776f726c64' },
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toEqual(account)

    expect(
      PersonalMessage.recoverAddress({
        curve: Curve.secp256k1(),
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

  test('curve: p256', () => {
    const signature = P256.sign({
      payload: PersonalMessage.getSignPayload(Hex.fromString('hello world')),
      privateKey: p256PrivateKey,
    })
    expect(
      PersonalMessage.recoverAddress({
        curve: Curve.p256(),
        message: 'hello world',
        signature,
      }),
    ).toEqual(
      Address.fromPublicKey(P256.getPublicKey({ privateKey: p256PrivateKey })),
    )
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
        address: accounts[1].address,
        message: 'hello world',
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(false)
  })

  test('behavior: mismatched message', () => {
    expect(
      PersonalMessage.verify({
        curve: Curve.secp256k1(),
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
        curve: Curve.secp256k1(),
        publicKey: Secp256k1.getPublicKey({
          privateKey: accounts[1].privateKey,
        }),
        message: 'hello world',
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(false)
  })

  test('curve: p256', () => {
    const signature = P256.sign({
      payload: PersonalMessage.getSignPayload(Hex.fromString('hello world')),
      privateKey: p256PrivateKey,
    })
    expect(
      PersonalMessage.verify({
        curve: Curve.p256(),
        publicKey: P256.getPublicKey({ privateKey: p256PrivateKey }),
        message: 'hello world',
        signature,
      }),
    ).toBe(true)
  })

  test('curve: webCrypto', async () => {
    const { privateKey, publicKey } = await WebCryptoP256.createKeyPair()
    const signature = await WebCryptoP256.sign({
      payload: PersonalMessage.getSignPayload(Hex.fromString('hello world')),
      privateKey,
    })
    expect(
      await PersonalMessage.verify({
        curve: Curve.webCrypto(),
        publicKey,
        message: 'hello world',
        signature,
      }),
    ).toBe(true)
  })

  test('curve: webAuthn', () => {
    const challenge = PersonalMessage.getSignPayload(Hex.fromString('gm'))
    const { metadata, signature } = signWebAuthn({ challenge })
    expect(
      PersonalMessage.verify({
        curve: Curve.webAuthn(),
        publicKey: getWebAuthnPublicKey(),
        message: 'gm',
        metadata,
        signature,
      }),
    ).toBe(true)
  })
})
