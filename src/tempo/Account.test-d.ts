import { privateKeyToAccount, toAccount } from 'viem/accounts'
import { Account, AccountConfig } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('fromConfigurable preserves config availability', () => {
  const config = {
    owners: [owner],
  } satisfies Account.fromConfigurable.Config
  const initial = Account.fromConfigurable(config)
  const normalizedInitial = Account.fromConfigurable({
    address: 'infer',
    ...AccountConfig.from({
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    }),
  })
  const current = Account.fromConfigurable({
    address: initial.address,
    owners: [owner],
    salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
    threshold: 1,
    version: 1,
  })
  const addressOnly = Account.fromConfigurable(initial.address)

  expectTypeOf(initial.config).toEqualTypeOf<AccountConfig.Config>()
  expectTypeOf(normalizedInitial.config).toEqualTypeOf<AccountConfig.Config>()
  expectTypeOf(current.config).toEqualTypeOf<AccountConfig.Config>()
  expectTypeOf(addressOnly.config).toEqualTypeOf<undefined>()
})

test('fromConfigurable distinguishes initial and current configs', () => {
  Account.fromConfigurable({ owners: [owner] })
  Account.fromConfigurable({ address: 'infer', owners: [owner] })
  // @ts-expect-error Current configs require `salt`.
  Account.fromConfigurable({
    address: owner.address,
    owners: [owner],
    threshold: 1,
    version: 1,
  })
  // @ts-expect-error Address-only accounts use the string overload.
  Account.fromConfigurable({
    address: owner.address,
  })
})

test('fromConfigurable rejects non-root owner accounts', () => {
  const child = Account.fromConfigurable({ owners: [owner] })
  const accessKey = Account.fromSecp256k1(`0x${'2'.repeat(64)}`, {
    access: child,
  })
  // @ts-expect-error Nested owners are unsupported.
  Account.fromConfigurable({ owners: [child] })
  // @ts-expect-error Weighted nested owners are unsupported.
  Account.fromConfigurable({ owners: [{ owner: child, weight: 1 }] })
  // @ts-expect-error Access-key owners are unsupported.
  Account.fromConfigurable({ owners: [accessKey] })
  // @ts-expect-error Weighted access-key owners are unsupported.
  Account.fromConfigurable({ owners: [{ owner: accessKey, weight: 1 }] })
})

test('fromConfigurable accepts primitive owner accounts', () => {
  const ethereumOwner = privateKeyToAccount(`0x${'1'.repeat(64)}`)
  Account.fromConfigurable({ owners: [owner, ethereumOwner, owner.address] })
  Account.fromConfigurable({ owners: [{ owner: ethereumOwner, weight: 2 }] })
})

test('fromConfigurable accepts custom local owners', () => {
  const customOwner = toAccount(privateKeyToAccount(`0x${'1'.repeat(64)}`))
  Account.fromConfigurable({ owners: [customOwner] })
  Account.fromConfigurable({ owners: [{ owner: customOwner, weight: 2 }] })
})
