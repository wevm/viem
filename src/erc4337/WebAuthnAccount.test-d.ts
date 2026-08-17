import type { Hex, WebAuthnP256 } from 'ox'
import type { Credential } from 'ox/webauthn'
import { expectTypeOf, test } from 'vitest'

import * as WebAuthnAccount from './WebAuthnAccount.js'

const types = {
  Mail: [{ name: 'contents', type: 'string' }],
} as const

test('fromCredential: accepts an ox credential', () => {
  const credential = {} as WebAuthnP256.P256Credential
  expectTypeOf(
    WebAuthnAccount.fromCredential(credential),
  ).toEqualTypeOf<WebAuthnAccount.Account>()
})

test('fromCredential: accepts a serialized ox credential', () => {
  const credential = {} as Credential.Credential<true>
  expectTypeOf(
    WebAuthnAccount.fromCredential(credential),
  ).toEqualTypeOf<WebAuthnAccount.Account>()
})

test('fromCredential: accepts persisted credential fields and preserves the id', () => {
  const account = WebAuthnAccount.fromCredential({
    id: 'test-credential',
    publicKey: '0x' as Hex.Hex,
  })

  expectTypeOf(account.id).toEqualTypeOf<'test-credential'>()
  expectTypeOf(account).toEqualTypeOf<
    WebAuthnAccount.Account<'test-credential'>
  >()
  expectTypeOf(account.publicKey).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(account.type).toEqualTypeOf<'webAuthn'>()
  expectTypeOf(account.sign({ hash: '0x' })).toEqualTypeOf<
    Promise<WebAuthnAccount.SignReturnType>
  >()
})

test('fromCredential: requires a credential id and public key', () => {
  // @ts-expect-error missing `id`
  WebAuthnAccount.fromCredential({ publicKey: '0x' as Hex.Hex })
  // @ts-expect-error missing `publicKey`
  WebAuthnAccount.fromCredential({ id: 'test-credential' })
})

test('signTypedData: infers typed data', async () => {
  const account = WebAuthnAccount.fromCredential({
    id: 'test-credential',
    publicKey: '0x' as Hex.Hex,
  })
  expectTypeOf(
    account.signTypedData({
      types,
      primaryType: 'Mail',
      message: { contents: 'hello' },
    }),
  ).toEqualTypeOf<Promise<WebAuthnAccount.SignReturnType>>()

  account.signTypedData({
    types,
    // @ts-expect-error not a valid primary type
    primaryType: 'NotAType',
    message: { contents: 'hello' },
  })
})
