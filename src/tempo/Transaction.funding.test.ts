import { FundingRequirement, NativeDexFunding } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import * as Formatters from './Formatters.js'
import * as Transaction from './Transaction.js'

const token = '0x20c0000000000000000000000000000000000000' as const
const requirement = FundingRequirement.from({
  token,
  amount: 50_000_000n,
  slippageBps: 0,
  sources: [
    {
      target: '0x1120000000000000000000000000000000000001',
      data: NativeDexFunding.encode({
        tokenIn: token,
        maxAmountIn: 30_000_000n,
      }),
    },
  ],
})

describe('getType', () => {
  test('infers Tempo from funding alone', () => {
    expect(Transaction.getType({ requireFunds: [requirement] })).toBe('tempo')
    expect(Transaction.getType({ to: token, gasPrice: 1n })).not.toBe('tempo')
  })
})

describe('formatTransactionRequest', () => {
  test('encodes complete requirements and explicit zero slippage', () => {
    const formatted = Formatters.formatTransactionRequest({
      requireFunds: [requirement],
    })
    expect(formatted.type).toBe('0x76')
    expect(formatted.requireFunds).toEqual([
      FundingRequirement.toRpc(requirement),
    ])
  })

  test('preserves requirements in estimation and simulation', () => {
    for (const action of ['estimateGas', 'call'])
      expect(
        Formatters.formatTransactionRequest(
          { requireFunds: [requirement] },
          action,
        ).requireFunds,
      ).toEqual([FundingRequirement.toRpc(requirement)])
  })
})

describe('serialize', () => {
  test('round-trips funding requirements', async () => {
    const encoded = await Transaction.serialize({
      chainId: 1337,
      calls: [{ to: token }],
      requireFunds: [requirement],
    })
    expect(
      Transaction.deserialize(encoded as Transaction.TransactionSerializedTempo)
        .requireFunds,
    ).toEqual([requirement])
  })

  test('omitted and empty funding preserve legacy bytes', async () => {
    const transaction = { chainId: 1337, calls: [{ to: token }] }
    expect(
      await Transaction.serialize({ ...transaction, requireFunds: [] }),
    ).toBe(await Transaction.serialize(transaction))
  })
})
