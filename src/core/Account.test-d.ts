import { describe, expectTypeOf, test } from 'vp/test'
import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'

import { Account } from '../index.js'
import * as AccountSubpath from 'viem/Account'

describe('Account', () => {
  test('types: is exposed from the root and subpath entrypoints', () => {
    expectTypeOf(Account.from).toEqualTypeOf<typeof AccountSubpath.from>()
    expectTypeOf<Account.Account>().toEqualTypeOf<AccountSubpath.Account>()
  })

  test('types: creates json-rpc accounts', () => {
    const account = Account.fromJsonRpc(
      '0x0000000000000000000000000000000000000000',
    )

    expectTypeOf(account).toEqualTypeOf<
      Account.JsonRpc<'0x0000000000000000000000000000000000000000'>
    >()
    expectTypeOf(
      account.address,
    ).toEqualTypeOf<'0x0000000000000000000000000000000000000000'>()
  })

  test('types: requires raw signing for local accounts', () => {
    Account.fromLocal({
      address: '0x0000000000000000000000000000000000000000',
      async sign() {
        return '0x'
      },
    })

    Account.fromLocal({
      address: '0x0000000000000000000000000000000000000000',
      // @ts-expect-error - local accounts must provide raw signing.
      sign() {
        return 123
      },
    })

    // @ts-expect-error - local accounts must provide raw signing.
    Account.fromLocal({
      address: '0x0000000000000000000000000000000000000000',
    })
  })

  test('types: creates private-key accounts', () => {
    const account = Account.fromPrivateKey(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    )

    expectTypeOf(account).toExtend<Account.PrivateKey>()
    expectTypeOf(account.address).toEqualTypeOf<Address.Address>()
    expectTypeOf(account.source).toEqualTypeOf<'privateKey'>()
  })

  test('types: creates hd and mnemonic accounts', () => {
    const mnemonic = Account.fromMnemonic(
      'test test test test test test test test test test test junk',
    )

    expectTypeOf(mnemonic).toExtend<Account.Mnemonic>()
    expectTypeOf(mnemonic.source).toEqualTypeOf<'mnemonic'>()
    expectTypeOf(mnemonic.getHdKey).toEqualTypeOf<
      () => import('ox/HdKey').HdKey
    >()
  })

  test('types: signs asynchronously', () => {
    const account = Account.fromPrivateKey(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    )

    expectTypeOf(Account.sign(account, { payload: '0x00' })).toEqualTypeOf<
      Promise<Hex.Hex>
    >()
    expectTypeOf(account.signMessage({ message: 'hello world' })).toEqualTypeOf<
      Promise<Hex.Hex>
    >()
  })
})
