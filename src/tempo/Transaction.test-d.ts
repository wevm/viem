import { MultisigConfig, Transaction } from 'viem/tempo'
import { test } from 'vitest'

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

test('funding requirements use executable values', () => {
  const token = '0x20c0000000000000000000000000000000000000'
  Transaction.serialize({
    chainId: 1337,
    calls: [],
    requireFunds: [{ token, amount: 50n, sources: [] }],
  })
  // @ts-expect-error Relay inference is not an executable funding requirement.
  Transaction.serialize({ chainId: 1337, calls: [], requireFunds: true })
  Transaction.serialize({
    chainId: 1337,
    calls: [],
    // @ts-expect-error Executable requirements must specify sources.
    requireFunds: [{ token, amount: 50n }],
  })
})
