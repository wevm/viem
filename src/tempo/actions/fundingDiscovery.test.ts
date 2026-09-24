import { describe, expect, test } from 'vitest'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import { discover } from './fundingDiscovery.js'

describe('discover.call', () => {
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
