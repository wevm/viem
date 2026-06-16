import { expectTypeOf, test } from 'vitest'

import * as PersonalMessage from '../utils/PersonalMessage.js'
import * as Curve from './Curve.js'

const address = '0x0000000000000000000000000000000000000000'

test('verify: return type follows curve sync/async', () => {
  // default (no curve) -> sync boolean
  expectTypeOf(
    PersonalMessage.verify({
      message: 'hello world',
      publicKey: '0x',
      signature: '0x',
    }),
  ).toEqualTypeOf<boolean>()

  // secp256k1 -> sync boolean
  expectTypeOf(
    PersonalMessage.verify({
      curve: Curve.secp256k1(),
      message: 'hello world',
      publicKey: '0x',
      signature: '0x',
    }),
  ).toEqualTypeOf<boolean>()

  // webCrypto -> async Promise<boolean>
  expectTypeOf(
    PersonalMessage.verify({
      curve: Curve.webCrypto(),
      message: 'hello world',
      publicKey: '0x',
      signature: '0x',
    }),
  ).toEqualTypeOf<Promise<boolean>>()
})

test('recoverPublicKey: only recoverable curves are assignable', () => {
  expectTypeOf(Curve.secp256k1()).toMatchTypeOf<Curve.Recoverable>()
  expectTypeOf(Curve.p256()).toMatchTypeOf<Curve.Recoverable>()
  // webCrypto / webAuthn are not recoverable
  expectTypeOf(Curve.webCrypto()).not.toMatchTypeOf<Curve.Recoverable>()
  expectTypeOf(Curve.webAuthn()).not.toMatchTypeOf<Curve.Recoverable>()
})

test('VerifyOptions: identity + extras per curve', () => {
  // secp256k1 (recoverable) accepts `address` OR `publicKey`
  expectTypeOf<
    keyof Curve.VerifyOptions<ReturnType<typeof Curve.secp256k1>>
  >().toEqualTypeOf<'signature' | 'address' | 'publicKey'>()

  // p256 / webCrypto are publicKey-only
  expectTypeOf<
    keyof Curve.VerifyOptions<ReturnType<typeof Curve.p256>>
  >().toEqualTypeOf<'signature' | 'publicKey'>()
  expectTypeOf<
    keyof Curve.VerifyOptions<ReturnType<typeof Curve.webCrypto>>
  >().toEqualTypeOf<'signature' | 'publicKey'>()

  // webAuthn surfaces metadata/origin/rpId (publicKey-only identity)
  expectTypeOf<
    keyof Curve.VerifyOptions<ReturnType<typeof Curve.webAuthn>>
  >().toEqualTypeOf<
    'signature' | 'publicKey' | 'metadata' | 'origin' | 'rpId'
  >()
})

test('verify: address or publicKey on the default (secp256k1) curve', () => {
  // address identity -> sync boolean
  expectTypeOf(
    PersonalMessage.verify({
      message: 'hello world',
      address,
      signature: '0x',
    }),
  ).toEqualTypeOf<boolean>()

  // publicKey identity -> sync boolean
  expectTypeOf(
    PersonalMessage.verify({
      message: 'hello world',
      publicKey: '0x',
      signature: '0x',
    }),
  ).toEqualTypeOf<boolean>()

  PersonalMessage.verify({
    curve: Curve.webCrypto(),
    message: 'hello world',
    // @ts-expect-error -- `address` is not accepted by publicKey-only curves
    address,
    signature: '0x',
  })
})

test('webAuthn: verify is sync and requires metadata', () => {
  const metadata = {} as Curve.VerifyOptions<
    ReturnType<typeof Curve.webAuthn>
  >['metadata']

  // webAuthn -> sync boolean, with metadata threaded through
  expectTypeOf(
    PersonalMessage.verify({
      curve: Curve.webAuthn(),
      message: 'hello world',
      metadata,
      publicKey: '0x',
      signature: '0x',
    }),
  ).toEqualTypeOf<boolean>()

  // @ts-expect-error -- metadata is required for webAuthn
  PersonalMessage.verify({
    curve: Curve.webAuthn(),
    message: 'hello world',
    publicKey: '0x',
    signature: '0x',
  })
})
