import { describe, expect, test } from 'vitest'

import { accounts, typedData } from '~test/constants.js'
import * as Secp256k1 from './Secp256k1.js'
import * as TypedData from './TypedData.js'

const account = accounts[0].address
const publicKey = Secp256k1.getPublicKey({
  privateKey: accounts[0].privateKey,
})

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
        primaryType: 'Mail',
        publicKey: Secp256k1.getPublicKey({
          privateKey: accounts[1].privateKey,
        }),
        signature:
          '0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b',
      }),
    ).toBe(false)
  })
})
