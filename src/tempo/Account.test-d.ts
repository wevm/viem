import { Account, type MultisigConfig } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('fromMultisig preserves config availability', () => {
  const initial = Account.fromMultisig({
    initialConfig: { owners: [owner] },
  })
  const current = Account.fromMultisig({
    address: initial.address,
    config: {
      owners: [owner],
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      threshold: 1,
      version: 1,
    },
  })
  const addressOnly = Account.fromMultisig(initial.address)
  const explicitAddressOnly = Account.fromMultisig({
    address: initial.address,
  })

  expectTypeOf(initial.config).toEqualTypeOf<MultisigConfig.Config>()
  expectTypeOf(current.config).toEqualTypeOf<MultisigConfig.Config>()
  expectTypeOf(addressOnly.config).toEqualTypeOf<undefined>()
  expectTypeOf(explicitAddressOnly.config).toEqualTypeOf<undefined>()
})

test('fromMultisig requires an explicit config role', () => {
  // @ts-expect-error Use `initialConfig` for the version-zero config.
  Account.fromMultisig({ owners: [owner] })
  Account.fromMultisig({
    address: owner.address,
    // @ts-expect-error Current config witnesses require all config fields.
    config: { owners: [owner], version: 1 },
  })
  Account.fromMultisig({
    address: owner.address,
    // @ts-expect-error Initial and current account forms are mutually exclusive.
    initialConfig: { owners: [owner] },
  })
})
