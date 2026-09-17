import { privateKeyToAccount, toAccount } from 'viem/accounts'
import { Account, MultisigConfig } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('fromMultisig preserves config availability', () => {
  const config = {
    owners: [owner],
  } satisfies Account.fromMultisig.Config
  const initial = Account.fromMultisig(config)
  const normalizedInitial = Account.fromMultisig({
    address: 'infer',
    ...MultisigConfig.from({
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    }),
  })
  const current = Account.fromMultisig({
    address: initial.address,
    owners: [owner],
    salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
    threshold: 1,
    version: 1,
  })
  const addressOnly = Account.fromMultisig(initial.address)

  expectTypeOf(initial.config).toEqualTypeOf<MultisigConfig.Config>()
  expectTypeOf(normalizedInitial.config).toEqualTypeOf<MultisigConfig.Config>()
  expectTypeOf(current.config).toEqualTypeOf<MultisigConfig.Config>()
  expectTypeOf(addressOnly.config).toEqualTypeOf<undefined>()
})

test('fromMultisig distinguishes initial and current configs', () => {
  Account.fromMultisig({ owners: [owner] })
  Account.fromMultisig({ address: 'infer', owners: [owner] })
  // @ts-expect-error Current configs require `salt`.
  Account.fromMultisig({
    address: owner.address,
    owners: [owner],
    threshold: 1,
    version: 1,
  })
  // @ts-expect-error Address-only accounts use the string overload.
  Account.fromMultisig({
    address: owner.address,
  })
})

test('fromMultisig rejects non-root owner accounts', () => {
  const child = Account.fromMultisig({ owners: [owner] })
  const accessKey = Account.fromSecp256k1(`0x${'2'.repeat(64)}`, {
    access: child,
  })
  // @ts-expect-error Nested multisig owners are unsupported.
  Account.fromMultisig({ owners: [child] })
  // @ts-expect-error Weighted nested multisig owners are unsupported.
  Account.fromMultisig({ owners: [{ owner: child, weight: 1 }] })
  // @ts-expect-error Access-key owners are unsupported.
  Account.fromMultisig({ owners: [accessKey] })
  // @ts-expect-error Weighted access-key owners are unsupported.
  Account.fromMultisig({ owners: [{ owner: accessKey, weight: 1 }] })
})

test('fromMultisig accepts primitive owner accounts', () => {
  const ethereumOwner = privateKeyToAccount(`0x${'1'.repeat(64)}`)
  Account.fromMultisig({ owners: [owner, ethereumOwner, owner.address] })
  Account.fromMultisig({ owners: [{ owner: ethereumOwner, weight: 2 }] })
})

test('fromMultisig accepts custom local owners', () => {
  const customOwner = toAccount(privateKeyToAccount(`0x${'1'.repeat(64)}`))
  Account.fromMultisig({ owners: [customOwner] })
  Account.fromMultisig({ owners: [{ owner: customOwner, weight: 2 }] })
})
