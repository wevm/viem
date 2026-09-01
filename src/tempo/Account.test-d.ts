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
