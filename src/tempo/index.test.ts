import { expect, test } from 'vitest'

import * as tempo from './index.js'

test('exports tempo', () => {
  expect(Object.keys(tempo)).toMatchInlineSnapshot(`
    [
      "Bytes",
      "PublicKey",
      "Secp256k1",
      "Period",
      "TempoAddress",
      "Tick",
      "TokenId",
      "VirtualAddress",
      "VirtualMaster",
      "Abis",
      "Account",
      "Addresses",
      "Actions",
      "Capabilities",
      "tempoActions",
      "Expiry",
      "Formatters",
      "Hardfork",
      "P256",
      "Storage",
      "TokenIds",
      "Transaction",
      "Transport",
      "walletNamespaceCompat",
      "withFeePayer",
      "withRelay",
      "WebAuthnP256",
      "WebCryptoP256",
    ]
  `)
})

test('exports tempo crypto helpers', () => {
  expect(Object.keys(tempo.Bytes)).toEqual(
    expect.arrayContaining(['from', 'random']),
  )
  expect(Object.keys(tempo.PublicKey)).toEqual(
    expect.arrayContaining(['compress', 'from', 'fromHex']),
  )
  expect(Object.keys(tempo.Secp256k1)).toEqual(
    expect.arrayContaining([
      'createKeyPair',
      'getPublicKey',
      'getSharedSecret',
      'randomPrivateKey',
    ]),
  )
})
