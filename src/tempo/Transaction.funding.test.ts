import {
  Addresses,
  FundingPolicy,
  FundingRequirement,
  FundingSource,
} from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as Formatters from './Formatters.js'
import * as Transaction from './Transaction.js'

const token = '0x20c0000000000000000000000000000000000000' as const
const requirement = FundingRequirement.from({
  token,
  amount: 50_000_000n,
  slippageBps: 0,
  sources: [FundingSource.dex({ maxAmountIn: 30_000_000n, tokenIn: token })],
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
    expect(formatted.requireFunds?.[0]?.sources?.[0]).toEqual({
      target: Addresses.dexFundingSource,
      data: requirement.sources[0]?.data,
    })
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

describe('behavior', () => {
  test.each(['decoded', 'encoded'] as const)(
    'normalizes %s rules before RPC formatting and signing',
    async (type) => {
      const rules = {
        maxSlippageBps: 100,
        sources: { [token]: [FundingSource.dex({ tokenIn: token })] },
      }
      const encoded = FundingPolicy.encode(rules)
      const input = {
        ...requirement,
        policyRules: type === 'decoded' ? rules : encoded,
      }
      const expected = { ...requirement, policyRules: encoded }
      for (const action of [undefined, 'estimateGas', 'call']) {
        expect(
          Formatters.formatTransactionRequest({ requireFunds: [input] }, action)
            .requireFunds,
        ).toEqual([FundingRequirement.toRpc(expected)])
      }
      const transaction = { chainId: 1337, calls: [{ to: token }] }
      expect(
        await Transaction.serialize({ ...transaction, requireFunds: [input] }),
      ).toBe(
        await Transaction.serialize({
          ...transaction,
          requireFunds: [expected],
        }),
      )
      expect(input).toHaveProperty('policyRules')
      expect(input).not.toHaveProperty('rules')
    },
  )
})
