import { Addresses, FundingPolicy, FundingSource } from 'viem/tempo'
import { expect, test } from 'vitest'
import { assertRequireFunds, type FundingRequirementIntent } from './funding.js'

const requirement = {
  amount: 50n,
  slippageBps: 100,
  token: Addresses.pathUsd,
} as const
const source = FundingSource.dex({ tokenIn: Addresses.alphaUsd })
const filled = { ...requirement, sources: [source] }

test('accepts discovered sources and omitted slippage and rules', () => {
  expect(() =>
    assertRequireFunds(
      [{ amount: 50n, token: Addresses.pathUsd }],
      [{ ...filled, policyRules: '0x1234' }],
    ),
  ).not.toThrow()
})

test('compares addresses and encoded policy rules by value', () => {
  const rules = { maxSlippageBps: 100, sources: {} }
  expect(() =>
    assertRequireFunds(
      [{ ...filled, policyRules: rules }],
      [
        {
          ...filled,
          token: '0x20C0000000000000000000000000000000000000',
          policyRules: FundingPolicy.encode(rules),
        },
      ],
    ),
  ).not.toThrow()
})

test.each([
  { name: 'missing', result: undefined },
  { name: 'removed', result: [] },
  { name: 'additional', result: [filled, filled] },
])('rejects $name requirements', ({ result }) => {
  expect(() =>
    assertRequireFunds([requirement], result),
  ).toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: \`eth_fillTransaction\` changed the funding requirements.]`,
  )
})

test.each([
  { token: Addresses.alphaUsd },
  { amount: 51n },
  { slippageBps: 101 },
  { slippageBps: undefined },
] satisfies Partial<FundingRequirementIntent>[])(
  'rejects changed funding targets %s',
  (changed) => {
    expect(() =>
      assertRequireFunds([requirement], [{ ...filled, ...changed }]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: \`eth_fillTransaction\` changed \`requireFunds[0]\`.]`,
    )
  },
)

test('rejects reordered requirements', () => {
  const other = { ...filled, token: Addresses.betaUsd } as const
  expect(() =>
    assertRequireFunds([requirement, other], [other, filled]),
  ).toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: \`eth_fillTransaction\` changed \`requireFunds[0]\`.]`,
  )
})

test.each([
  { sources: [] },
  { sources: [source, source] },
  { sources: [{ ...source, target: Addresses.fundingDiscovery }] },
  { sources: [{ ...source, data: '0x1234' }] },
  { policyRules: '0x5678' },
  { policyRules: undefined },
] satisfies Partial<FundingRequirementIntent>[])(
  'rejects changes to explicit fields %s',
  (changed) => {
    expect(() =>
      assertRequireFunds(
        [{ ...filled, policyRules: '0x1234' }],
        [{ ...filled, policyRules: '0x1234', ...changed }],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: \`eth_fillTransaction\` changed \`requireFunds[0]\`.]`,
    )
  },
)

test('preserves an explicitly empty source list', () => {
  expect(() =>
    assertRequireFunds([{ ...requirement, sources: [] }], [filled]),
  ).toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: \`eth_fillTransaction\` changed \`requireFunds[0]\`.]`,
  )
})
