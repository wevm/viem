import { describe, expect, test } from 'vitest'

import { accounts } from '~test/constants.js'
import * as Authorization from './Authorization.js'
import * as Secp256k1 from './Secp256k1.js'

const account = accounts[0]

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
      Authorization.recoverAddress({ authorization: signedAuthorization() }),
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
    expect(Authorization.recoverAddress({ authorization, signature })).toBe(
      account.address,
    )
  })
})

describe('verify', () => {
  test('default', () => {
    expect(
      Authorization.verify({
        address: account.address,
        authorization: signedAuthorization(),
      }),
    ).toBe(true)
  })

  test('behavior: mismatched address', () => {
    expect(
      Authorization.verify({
        address: accounts[1].address,
        authorization: signedAuthorization(),
      }),
    ).toBe(false)
  })
})
