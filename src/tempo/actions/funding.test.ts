import { FundingPolicy } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import { discover, setPolicyAdmins, setPolicyRules } from './funding.js'

describe('discover.call', () => {
  test.each([undefined, 1n])(
    'encodes decoded rules (policy: %s)',
    (policyId) => {
      const rules = {
        maxSlippageBps: 100,
        sources: {
          [Addresses.pathUsd]: [
            { to: Addresses.dexFundingSource, data: '0x1234' },
          ],
        },
      } as const
      const parameters = {
        account: '0x0000000000000000000000000000000000000001',
        amount: 50_000_000n,
        policyId,
        token: Addresses.pathUsd,
      } as const

      expect(discover.call({ ...parameters, rules }).data).toBe(
        discover.call({ ...parameters, rules: FundingPolicy.encode(rules) })
          .data,
      )
    },
  )

  test('discovers without a stored policy', () => {
    const call = discover.call({
      account: '0x0000000000000000000000000000000000000001',
      amount: 50_000_000n,
      rules: '0x1234',
      token: Addresses.pathUsd,
    })

    expect(call.to).toBe(Addresses.fundingDiscovery)
    expect(call.data.slice(0, 10)).toBe('0xc2524450')
    expect(
      decodeFunctionData({ abi: Abis.fundingDiscovery, data: call.data }).args,
    ).toEqual([
      '0x0000000000000000000000000000000000000001',
      '0x20C0000000000000000000000000000000000000',
      50_000_000n,
      '0x1234',
    ])
  })

  test.each([0n, 1n])('checks a supplied policy ID (%s)', (policyId) => {
    const call = discover.call({
      account: '0x0000000000000000000000000000000000000001',
      amount: 50_000_000n,
      policyId,
      rules: '0x1234',
      token: Addresses.pathUsd,
    })

    expect(call.data.slice(0, 10)).toBe('0x3cdf692f')
    expect(
      decodeFunctionData({ abi: Abis.fundingDiscovery, data: call.data }).args,
    ).toEqual([
      policyId,
      '0x0000000000000000000000000000000000000001',
      '0x20C0000000000000000000000000000000000000',
      50_000_000n,
      '0x1234',
    ])
  })
})

describe('setPolicyAdmins.call', () => {
  test('encodes the policy precompile call', () => {
    const call = setPolicyAdmins.call({
      policyId: 1n,
      admins: [Addresses.pathUsd],
    })
    expect(
      decodeFunctionData({ abi: Abis.fundingPolicy, data: call.data }),
    ).toEqual({
      functionName: 'setAdmins',
      args: [1n, ['0x20C0000000000000000000000000000000000000']],
    })
  })
})

describe('setPolicyRules.call', () => {
  test('encodes the policy precompile call', () => {
    const call = setPolicyRules.call({
      policyId: 1n,
      rules: { maxSlippageBps: 100, sources: {} },
    })
    expect(
      decodeFunctionData({ abi: Abis.fundingPolicy, data: call.data }),
    ).toEqual({
      functionName: 'setRules',
      args: [1n, { maxSlippageBps: 100, routes: [] }],
    })
  })
})
