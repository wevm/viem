import type * as Hex from 'ox/Hex'
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
})

test('local accounts resolve sync (sign returns Hex | Promise<Hex>)', () => {
  const account = Account.fromPrivateKey('0x')
  expectTypeOf(account.type).toEqualTypeOf<'local'>()
  expectTypeOf(account.source).toEqualTypeOf<'privateKey'>()
  expectTypeOf(account.publicKey).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(account.sign).returns.toEqualTypeOf<Hex.Hex | Promise<Hex.Hex>>()
})

test('hd accounts expose getHdKey', () => {
  const account = Account.fromMnemonic('test')
  expectTypeOf(account.source).toEqualTypeOf<'hd'>()
  expectTypeOf(account.getHdKey).toBeFunction()
})
