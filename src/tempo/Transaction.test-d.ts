import { AccountConfig, createClient, Transaction } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const from = '0x0000000000000000000000000000000000000001'
const accountSimulation = {
  approvals: [],
  config: AccountConfig.from({
    owners: [{ owner: from, weight: 1 }],
    threshold: 1,
  }),
}

test('serialize requires a sender when combining account simulation and approvals', () => {
  const transaction = { calls: [], chainId: 1337 }
  Transaction.serialize({ ...transaction, accountSimulation })
  Transaction.serialize({ ...transaction, signatures: [] })
  Transaction.serialize({
    ...transaction,
    from,
    accountSimulation,
    signatures: [],
  })
  // @ts-expect-error Owner approvals require an explicit sender.
  Transaction.serialize({ ...transaction, accountSimulation, signatures: [] })
})

test('transfer actions accept sponsorship opt-out and external relay URLs', () => {
  const client = createClient()
  expectTypeOf<false | string>().toMatchTypeOf<
    Parameters<typeof client.token.transferSync>[0]['feePayer']
  >()
})
