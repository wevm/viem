import { describe, expect, test } from 'vitest'

import { base, localhost, mainnet } from '../chains/index.js'
import { createPublicClient, http } from '../index.js'
import { getUsdcContract } from './getUsdcContract.js'
import { usdcAddresses } from './usdc.js'
import { getUsdcAddress } from './utils.js'

describe('usdcAddresses', () => {
  test('exposes native USDC on mainnet', () => {
    expect(usdcAddresses[mainnet.id]).toBe(
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    )
  })
})

describe('getUsdcAddress', () => {
  test('resolves by chain id', () => {
    expect(getUsdcAddress(base.id)).toBe(
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    )
  })
})

describe('getUsdcContract', () => {
  test('builds a contract instance at the chain USDC address', () => {
    const client = createPublicClient({ chain: base, transport: http() })
    const usdc = getUsdcContract(client)
    expect(usdc.address).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
    expect(usdc.read.balanceOf).toBeDefined()
  })

  test('throws on a chain without native USDC', () => {
    const client = createPublicClient({ chain: localhost, transport: http() })
    expect(() => getUsdcContract(client)).toThrowError(/not available/)
  })
})
