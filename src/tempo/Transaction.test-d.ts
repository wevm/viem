import { createClient, MultisigConfig, Transaction } from 'viem/tempo'
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

test('transfer actions accept sponsorship opt-out and external relay URLs', () => {
  const client = createClient()
  expectTypeOf<false | string>().toMatchTypeOf<
    Parameters<typeof client.token.transferSync>[0]['feePayer']
  >()
})
