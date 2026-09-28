import {
  Actions,
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
  test.each([
    Actions.token.transfer.call({
      token,
      amount: 50n,
      to: Addresses.alphaUsd,
      memo: `0x${'00'.repeat(32)}`,
    }),
    Actions.token.burn.call({ token, amount: 50n }),
    Actions.token.burn.call({
      token,
      amount: 50n,
      memo: `0x${'00'.repeat(32)}`,
    }),
    Actions.dex.sell.call({
      tokenIn: token,
      tokenOut: Addresses.alphaUsd,
      amountIn: 50n,
      minAmountOut: 0n,
    }),
  ])('resolves known calldata defaults ($functionName)', (call) => {
    expect(
      Formatters.formatTransactionRequest(
        {
          calls: [call],
          requireFunds: [{ sources: [] }],
        },
        'call',
      ).requireFunds,
    ).toEqual([
      {
        token: expect.stringMatching(
          /^0x20c0000000000000000000000000000000000000$/i,
        ),
        amount: '0x32',
        sources: [],
      },
    ])
  })

  test('preserves partial fields for relay resolution', () => {
    const formatted = Formatters.formatTransactionRequest(
      {
        calls: [
          {
            to: '0x9999999999999999999999999999999999999999',
            data: '0x12345678',
          },
        ],
        requireFunds: [{ sources: [] }, { token, amount: 0n }],
      },
      'fillTransaction',
    )
    expect(JSON.parse(JSON.stringify(formatted.requireFunds))).toEqual([
      { sources: [] },
      { token, amount: '0x0' },
    ])
  })

  test.each([0n, 50n])(
    'resolves transfer defaults without a relay (%s)',
    (amount) => {
      const formatted = Formatters.formatTransactionRequest(
        {
          calls: [
            Actions.token.transfer.call({
              token,
              amount,
              to: Addresses.alphaUsd,
            }),
          ],
          requireFunds: [
            { sources: [] },
            { token: Addresses.betaUsd, amount: 0n, sources: [] },
          ],
        },
        'call',
      )
      expect(formatted.requireFunds).toEqual([
        { token, amount: amount === 0n ? '0x0' : '0x32', sources: [] },
        { token: Addresses.betaUsd, amount: '0x0', sources: [] },
      ])
    },
  )

  test('preserves omitted sources for JSON-RPC wallets', () => {
    expect(
      Formatters.formatTransactionRequest(
        { requireFunds: [{ token, amount: 50n }] },
        'sendTransaction',
      ),
    ).toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "data": "0x",
            "to": "0x0000000000000000000000000000000000000000",
            "value": "0x",
          },
        ],
        "data": undefined,
        "requireFunds": [
          {
            "amount": "0x32",
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ],
        "to": undefined,
        "type": "0x76",
        "value": undefined,
      }
    `)
  })

  test.each(['signTransaction'])(
    'rejects unresolved sources for %s',
    (action) => {
      expect(() =>
        Formatters.formatTransactionRequest(
          { requireFunds: [{ token, amount: 50n }] },
          action,
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Resolve omitted funding fields with \`eth_fillTransaction\` before signing.]`,
      )
    },
  )

  test('encodes complete requirements and explicit zero slippage', () => {
    const formatted = Formatters.formatTransactionRequest({
      requireFunds: [requirement],
    })
    expect(formatted.type).toBe('0x76')
    expect(formatted.requireFunds).toEqual([
      FundingRequirement.toRpc(requirement),
    ])
    expect(
      (formatted.requireFunds === true
        ? undefined
        : formatted.requireFunds)?.[0]?.sources?.[0],
    ).toEqual({
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
  test.each(
    ['decoded', 'encoded'].flatMap((type) =>
      [undefined, false, true].map((enforceOrder) => ({ type, enforceOrder })),
    ),
  )(
    'normalizes $type rules with enforceOrder=$enforceOrder before RPC formatting and signing',
    async ({ type, enforceOrder }) => {
      const rules = {
        enforceOrder,
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

test('formats automatic requirements before relay resolution', () => {
  for (const action of [
    'fillTransaction',
    'sendTransaction',
    'estimateGas',
    'call',
  ])
    expect(
      Formatters.formatTransactionRequest({ requireFunds: true }, action)
        .requireFunds,
    ).toBe(true)
  for (const action of ['signTransaction'])
    expect(() =>
      Formatters.formatTransactionRequest({ requireFunds: true }, action),
    ).toThrow('before signing')
})
