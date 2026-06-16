import * as Address from 'ox/Address'
import * as P256 from 'ox/P256'
import * as WebCryptoP256 from 'ox/WebCryptoP256'
import { describe, expect, test } from 'vitest'

import { accounts, typedData } from '~test/constants.js'
import { getWebAuthnPublicKey, signWebAuthn } from '~test/webauthn.js'
import * as Curve from '../core/Curve.js'
import * as Secp256k1 from './Secp256k1.js'
import * as TypedData from './TypedData.js'

const account = accounts[0].address
const publicKey = Secp256k1.getPublicKey({
  privateKey: accounts[0].privateKey,
})

const p256PrivateKey = P256.randomPrivateKey()

const basic = { ...typedData.basic, primaryType: 'Mail' } as const
const signPayload = TypedData.getSignPayload(basic)

describe('recoverAddress', () => {
  test('default', () => {
    expect(
      TypedData.recoverAddress({
        ...typedData.basic,
        primaryType: 'Mail',
        signature:
          '0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b',
      }),
    ).toEqual(account)

    expect(
      TypedData.recoverAddress({
        ...typedData.complex,
        primaryType: 'Mail',
        signature:
          '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e0988491c',
      }),
    ).toEqual(account)
  })

  test('curve: p256', () => {
    const signature = P256.sign({
      payload: signPayload,
      privateKey: p256PrivateKey,
    })
    expect(
      TypedData.recoverAddress({
        ...basic,
        curve: Curve.p256(),
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
      TypedData.verify({
        ...typedData.basic,
        primaryType: 'Mail',
        publicKey,
        signature:
          '0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b',
      }),
    ).toBe(true)
  })

  test('behavior: mismatched public key', () => {
    expect(
      TypedData.verify({
        ...typedData.basic,
        curve: Curve.secp256k1(),
        primaryType: 'Mail',
        publicKey: Secp256k1.getPublicKey({
          privateKey: accounts[1].privateKey,
        }),
        signature:
          '0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b',
      }),
    ).toBe(false)
  })

  test('curve: p256', () => {
    const signature = P256.sign({
      payload: signPayload,
      privateKey: p256PrivateKey,
    })
    expect(
      TypedData.verify({
        ...basic,
        curve: Curve.p256(),
        publicKey: P256.getPublicKey({ privateKey: p256PrivateKey }),
        signature,
      }),
    ).toBe(true)
  })

  test('curve: webCrypto', async () => {
    const { privateKey, publicKey } = await WebCryptoP256.createKeyPair()
    const signature = await WebCryptoP256.sign({
      payload: signPayload,
      privateKey,
    })
    expect(
      await TypedData.verify({
        ...basic,
        curve: Curve.webCrypto(),
        publicKey,
        signature,
      }),
    ).toBe(true)
  })

  test('curve: webAuthn', () => {
    const { metadata, signature } = signWebAuthn({ challenge: signPayload })
    expect(
      TypedData.verify({
        ...basic,
        curve: Curve.webAuthn(),
        publicKey: getWebAuthnPublicKey(),
        metadata,
        signature,
      }),
    ).toBe(true)
  })
})
