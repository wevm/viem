import { Account, MultisigConfig } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('fromMultisig preserves config availability', () => {
  const initial = Account.fromMultisig({
    address: 'initial',
    owners: [owner],
  })
  const normalizedInitial = Account.fromMultisig({
    address: 'initial',
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
  Account.fromMultisig({ address: 'initial', owners: [owner] })
  // @ts-expect-error Current config witnesses require `salt`.
  Account.fromMultisig({
    address: owner.address,
    owners: [owner],
    threshold: 1,
    version: 1,
  })
  // @ts-expect-error Initial configs use the `initial` address sentinel.
  Account.fromMultisig({ owners: [owner] })
  // @ts-expect-error Address-only accounts use the string overload.
  Account.fromMultisig({
    address: owner.address,
  })
})
