import type { FundingRequirement } from 'ox/tempo'
import { Addresses } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { assertRequireFunds } from './funding.js'

describe('assertRequireFunds', () => {
  const requirement = {
    token: Addresses.pathUsd,
    amount: 50n,
    slippageBps: 100,
    policyRules: '0xabcd',
    sources: [{ target: Addresses.dexFundingSource, data: '0xabcd' }],
  } as const

  test('accepts inferred fields and unconstrained automatic funding', () => {
    expect(() => {
      assertRequireFunds([{ token: Addresses.pathUsd }], [requirement])
      assertRequireFunds([{ amount: 50n, sources: undefined }], [requirement])
      assertRequireFunds(true, [requirement])
      assertRequireFunds(true, [])
      assertRequireFunds(undefined, undefined)
      assertRequireFunds([], [])
    }).not.toThrow()
  })

  test('compares canonical fields regardless of hex casing or source property order', () => {
    expect(() =>
      assertRequireFunds(
        [requirement],
        [
          {
            ...requirement,
            token: '0x20C0000000000000000000000000000000000000',
            policyRules: '0xABCD',
            sources: [{ data: '0xABCD', target: Addresses.dexFundingSource }],
          },
        ],
      ),
    ).not.toThrow()
  })

  test.each([
    ['token', { token: Addresses.alphaUsd }],
    ['amount', { amount: 51n }],
    ['slippageBps', { slippageBps: 101 }],
    ['slippageBps', { slippageBps: undefined }],
    ['policyRules', { policyRules: '0xabce' }],
    ['policyRules', { policyRules: undefined }],
    ['sources', { sources: [] }],
    [
      'sources',
      { sources: [{ target: Addresses.fundingPolicy, data: '0xabcd' }] },
    ],
    [
      'sources',
      { sources: [{ target: Addresses.dexFundingSource, data: '0xabce' }] },
    ],
  ] satisfies [string, Partial<FundingRequirement.FundingRequirement>][])(
    'rejects changed %s',
    (field, change) => {
      expect(() =>
        assertRequireFunds([requirement], [{ ...requirement, ...change }]),
      ).toThrow(`Funding relay changed \`requireFunds[0].${field}\`.`)
    },
  )

  test('preserves explicit zero amounts, zero slippage, and empty sources', () => {
    expect(() => assertRequireFunds([{ amount: 0n }], [requirement])).toThrow(
      'requireFunds[0].amount',
    )
    expect(() =>
      assertRequireFunds([{ slippageBps: 0 }], [requirement]),
    ).toThrow('requireFunds[0].slippageBps')
    expect(() => assertRequireFunds([{ sources: [] }], [requirement])).toThrow(
      'requireFunds[0].sources',
    )
  })

  test('rejects missing and added requirements', () => {
    for (const filled of [undefined, [], [requirement, requirement]])
      expect(() => assertRequireFunds([requirement], filled)).toThrow(
        'Funding relay changed the number of funding requirements.',
      )
  })

  test('preserves requirement and source order', () => {
    const other = { ...requirement, token: Addresses.alphaUsd } as const
    expect(() =>
      assertRequireFunds([requirement, other], [other, requirement]),
    ).toThrow('requireFunds[0].token')
    const sources = [
      ...requirement.sources,
      { target: Addresses.dexFundingSource, data: '0x1234' },
    ] as const
    expect(() =>
      assertRequireFunds(
        [{ sources }],
        [{ ...requirement, sources: [...sources].reverse() }],
      ),
    ).toThrow('requireFunds[0].sources')
  })
})
