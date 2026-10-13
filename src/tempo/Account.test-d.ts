import { expectTypeOf, test } from 'vitest'

import * as viem_Account from '../core/Account.js'
import * as Account from './Account.js'

const privateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const privateKey_p256 =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

test('from: discriminates on `access`', () => {
  const root = Account.fromSecp256k1(privateKey)
  expectTypeOf(root).toEqualTypeOf<Account.RootAccount>()
  expectTypeOf(root.source).toEqualTypeOf<'root'>()
  expectTypeOf(root.signKeyAuthorization).toBeFunction()

  const accessKey = Account.fromSecp256k1(privateKey_p256, { access: root })
  expectTypeOf(accessKey).toEqualTypeOf<Account.AccessKeyAccount>()
  expectTypeOf(accessKey.source).toEqualTypeOf<'accessKey'>()
  expectTypeOf(accessKey.accessKeyAddress).toEqualTypeOf<`0x${string}`>()
})

test('accounts satisfy the core local account shape', () => {
  const root = Account.fromSecp256k1(privateKey)
  expectTypeOf(root).toMatchTypeOf<viem_Account.Local>()
  expectTypeOf(root).toMatchTypeOf<viem_Account.Account>()

  const accessKey = Account.fromP256(privateKey_p256, { access: root })
  expectTypeOf(accessKey).toMatchTypeOf<viem_Account.Local>()

  const configurable = Account.fromConfig({
    owners: [{ owner: root.address, weight: 1 }],
    threshold: 1,
  })
  expectTypeOf(configurable).toMatchTypeOf<viem_Account.Local>()
})

test('keyType is narrowed to signature envelope types', () => {
  const account = Account.fromP256(privateKey_p256)
  expectTypeOf(account.keyType).toEqualTypeOf<
    'secp256k1' | 'p256' | 'webAuthn'
  >()
})

test('Account union discriminates on `source`', () => {
  const account = {} as Account.Account
  if (account.source === 'accessKey') {
    expectTypeOf(account.accessKeyAddress).toEqualTypeOf<`0x${string}`>()
  }
  if (account.source === 'root') {
    expectTypeOf(account.signKeyAuthorization).toBeFunction()
  }
})

const owner = Account.fromSecp256k1(privateKey)

test('fromConfig rejects non-root owner accounts', () => {
  const child = Account.fromConfig({ owners: [owner] })
  const accessKey = Account.fromSecp256k1(`0x${'2'.repeat(64)}`, {
    access: child,
  })
  // @ts-expect-error Nested owners are unsupported.
  Account.fromConfig({ owners: [child] })
  // @ts-expect-error Weighted nested owners are unsupported.
  Account.fromConfig({ owners: [{ owner: child, weight: 1 }] })
  // @ts-expect-error Access-key owners are unsupported.
  Account.fromConfig({ owners: [accessKey] })
  // @ts-expect-error Weighted access-key owners are unsupported.
  Account.fromConfig({ owners: [{ owner: accessKey, weight: 1 }] })
})

test('fromConfig accepts primitive owner accounts', () => {
  const ethereumOwner = viem_Account.fromPrivateKey(`0x${'1'.repeat(64)}`)
  Account.fromConfig({ owners: [owner, ethereumOwner, owner.address] })
  Account.fromConfig({ owners: [{ owner: ethereumOwner, weight: 2 }] })
})

test('fromConfig accepts custom local owners', () => {
  const customOwner = viem_Account.from(
    viem_Account.fromPrivateKey(`0x${'1'.repeat(64)}`),
  )
  Account.fromConfig({ owners: [customOwner] })
  Account.fromConfig({ owners: [{ owner: customOwner, weight: 2 }] })
})
