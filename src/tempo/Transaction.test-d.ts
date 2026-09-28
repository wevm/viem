import type { SignatureEnvelope } from 'ox/tempo'
import { MultisigConfig, Transaction } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const from = '0x0000000000000000000000000000000000000001'
const multisigSimulation = {
  approvals: [],
  config: MultisigConfig.from({
    owners: [{ owner: from, weight: 1 }],
    threshold: 1,
  }),
}

test('serialize requires a sender when combining multisig simulation and approvals', () => {
  const transaction = { calls: [], chainId: 1337 }
  Transaction.serialize({ ...transaction, multisigSimulation })
  Transaction.serialize({ ...transaction, signatures: [] })
  Transaction.serialize({
    ...transaction,
    from,
    multisigSimulation,
    signatures: [],
  })
  // @ts-expect-error Multisig approvals require an explicit sender.
  Transaction.serialize({ ...transaction, multisigSimulation, signatures: [] })
})

test('preserves all protocol key authorization types', () => {
  type Type = SignatureEnvelope.Type | 'multisig'
  expectTypeOf<
    NonNullable<Transaction.TransactionTempo['keyAuthorization']>['type']
  >().toEqualTypeOf<Type>()
  expectTypeOf<
    NonNullable<Transaction.TransactionRequestTempo['keyAuthorization']>['type']
  >().toEqualTypeOf<Type>()
  expectTypeOf<
    NonNullable<
      Transaction.TransactionSerializableTempo['keyAuthorization']
    >['type']
  >().toEqualTypeOf<Type>()
  expectTypeOf<
    NonNullable<
      Extract<Transaction.TransactionRpc, { type: '0x76' }>['keyAuthorization']
    >['keyType']
  >().toEqualTypeOf<Type>()
})
