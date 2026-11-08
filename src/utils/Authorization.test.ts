import { describe, expect, test } from 'vitest'

import * as constants from '~test/constants.js'
import { Authorization, Secp256k1 } from 'viem/utils'

const account = constants.accounts[0]

function signedAuthorization() {
  const authorization = Authorization.from({
    address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
    chainId: 1,
    nonce: 0n,
  })
  const signature = Secp256k1.sign({
    payload: Authorization.getSignPayload(authorization),
    privateKey: account.privateKey,
  })
  return Authorization.from(authorization, { signature })
}

describe('recoverAddress', () => {
  test('default', () => {
    expect(
      Authorization.recoverAddress({
        authorization: signedAuthorization(),
      }),
    ).toBe(account.address)
  })

  test('args: signature', () => {
    const authorization = Authorization.from({
      address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
      chainId: 1,
      nonce: 0n,
    })
    const signature = Secp256k1.sign({
      payload: Authorization.getSignPayload(authorization),
      privateKey: account.privateKey,
    })
    expect(
      Authorization.recoverAddress({
        authorization,
        signature,
      }),
    ).toBe(account.address)
  })

  test('error: yParity above 1', () => {
    expect(() =>
      Authorization.recoverAddress({
        authorization: { ...signedAuthorization(), yParity: 27 },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Signature.InvalidYParityError: Value \`27\` is an invalid y-parity value. Y-parity must be 0 or 1.]`,
    )
  })

  test('error: unsigned authorization', () => {
    expect(() =>
      Authorization.recoverAddress({
        authorization: Authorization.from({
          address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
          chainId: 1,
          nonce: 0n,
        }),
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      '[Authorization.MissingSignatureError: Authorization is unsigned. An unsigned authorization requires a `signature` option.]',
    )
  })
})

describe('verify', () => {
  test('default', () => {
    expect(
      Authorization.verify({
        authorization: signedAuthorization(),
        publicKey: Secp256k1.getPublicKey({ privateKey: account.privateKey }),
      }),
    ).toBe(true)
  })

  test('behavior: mismatched public key', () => {
    expect(
      Authorization.verify({
        authorization: signedAuthorization(),
        publicKey: Secp256k1.getPublicKey({
          privateKey: constants.accounts[1].privateKey,
        }),
      }),
    ).toBe(false)
  })

  test('behavior: yParity above 1 has no authority', () => {
    expect(
      Authorization.verify({
        authorization: { ...signedAuthorization(), yParity: 27 },
        address: account.address,
      }),
    ).toBe(false)
  })

  test('error: unsigned authorization', () => {
    expect(() =>
      Authorization.verify({
        authorization: Authorization.from({
          address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
          chainId: 1,
          nonce: 0n,
        }),
        publicKey: Secp256k1.getPublicKey({ privateKey: account.privateKey }),
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      '[Authorization.MissingSignatureError: Authorization is unsigned. An unsigned authorization requires a `signature` option.]',
    )
  })
})
