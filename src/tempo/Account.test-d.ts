import { privateKeyToAccount, toAccount } from 'viem/accounts'
import { Account, AccountConfig } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('fromConfig preserves config availability', () => {
  const config = {
    owners: [owner],
  } satisfies Account.fromConfig.Config
  const initial = Account.fromConfig(config)
  const normalizedInitial = Account.fromConfig({
    address: 'infer',
    ...AccountConfig.from({
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    }),
  })
  const current = Account.fromConfig({
    address: initial.address,
    owners: [owner],
    salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
    threshold: 1,
    version: 1,
  })
  const addressOnly = Account.fromConfig(initial.address)

  expectTypeOf(initial.config).toEqualTypeOf<AccountConfig.Config>()
  expectTypeOf(normalizedInitial.config).toEqualTypeOf<AccountConfig.Config>()
  expectTypeOf(current.config).toEqualTypeOf<AccountConfig.Config>()
  expectTypeOf(addressOnly.config).toEqualTypeOf<undefined>()
})

test('fromConfig distinguishes initial and current configs', () => {
  Account.fromConfig({ owners: [owner] })
  Account.fromConfig({ address: 'infer', owners: [owner] })
  // @ts-expect-error Current configs require `salt`.
  Account.fromConfig({
    address: owner.address,
    owners: [owner],
    threshold: 1,
    version: 1,
  })
  // @ts-expect-error Address-only accounts use the string overload.
  Account.fromConfig({
    address: owner.address,
  })
})

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
  const ethereumOwner = privateKeyToAccount(`0x${'1'.repeat(64)}`)
  Account.fromConfig({ owners: [owner, ethereumOwner, owner.address] })
  Account.fromConfig({ owners: [{ owner: ethereumOwner, weight: 2 }] })
})

test('fromConfig accepts custom local owners', () => {
  const customOwner = toAccount(privateKeyToAccount(`0x${'1'.repeat(64)}`))
  Account.fromConfig({ owners: [customOwner] })
  Account.fromConfig({ owners: [{ owner: customOwner, weight: 2 }] })
})
