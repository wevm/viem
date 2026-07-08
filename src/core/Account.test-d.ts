import type { Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Account } from 'viem'

test('from: address -> JsonRpc, custom source -> Local', () => {
  expectTypeOf(
    Account.from('0x0000000000000000000000000000000000000000'),
  ).toEqualTypeOf<Account.JsonRpc>()

  const local = Account.from({
    address: '0x0000000000000000000000000000000000000000',
    sign: ({ hash: _ }: { hash: Hex.Hex }) => '0x' as const,
    signMessage: () => '0x' as const,
    signTransaction: () => '0x' as const,
    signTypedData: () => '0x' as const,
  })
  expectTypeOf(local).toEqualTypeOf<Account.Local<'custom'>>()

  const fromPublicKey = Account.from({
    publicKey: '0x' as Hex.Hex,
    sign: ({ hash: _ }: { hash: Hex.Hex }) => '0x' as const,
  })
  expectTypeOf(fromPublicKey).toEqualTypeOf<
    Account.Local<'custom'> & { publicKey: Hex.Hex }
  >()
})

test('from: source requires address or publicKey', () => {
  // @ts-expect-error missing both `address` and `publicKey`
  Account.from({ sign: ({ hash: _ }: { hash: Hex.Hex }) => '0x' as const })
})

test('from: infers passed keyType', () => {
  const account = Account.from({
    address: '0x0000000000000000000000000000000000000000',
    keyType: 'p256',
    sign: ({ hash: _ }: { hash: Hex.Hex }) => '0x' as const,
  })
  expectTypeOf(account.keyType).toEqualTypeOf<'p256'>()
  expectTypeOf(account.type).toEqualTypeOf<'local'>()
})

test('local accounts resolve sync (sign returns Hex | Promise<Hex>)', () => {
  const account = Account.fromPrivateKey('0x')
  expectTypeOf(account.type).toEqualTypeOf<'local'>()
  expectTypeOf(account.keyType).toEqualTypeOf<'secp256k1'>()
  expectTypeOf(account.publicKey).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(account.sign).returns.toEqualTypeOf<Hex.Hex | Promise<Hex.Hex>>()
})

test('hd accounts expose getHdKey', () => {
  const account = Account.fromMnemonic('test')
  expectTypeOf(account.keyType).toEqualTypeOf<'secp256k1'>()
  expectTypeOf(account.getHdKey).toBeFunction()
})
