import { describe, expect, test } from 'vp/test'

import {
  anvilMainnet,
  anvilOptimism,
  getPoolId,
  request,
  requestUrl,
} from './anvil.js'

describe('anvil', () => {
  test('behavior: creates pool-scoped rpc urls for multiple chains', () => {
    const poolId = getPoolId()

    expect(anvilMainnet.rpcUrl.http).toMatch(
      new RegExp(`^http://127\\.0\\.0\\.1:\\d+/${poolId}$`),
    )
    expect(anvilOptimism.rpcUrl.http).toMatch(
      new RegExp(`^http://127\\.0\\.0\\.1:\\d+/${poolId}$`),
    )
    expect(anvilMainnet.rpcUrl.http).not.toBe(anvilOptimism.rpcUrl.http)
  })

  test('behavior: serves multiple anvil chains', async () => {
    const [mainnet, optimism] = await Promise.all([
      request(anvilMainnet, 'eth_chainId'),
      request(anvilOptimism, 'eth_chainId'),
    ])

    expect(mainnet).toBe('0x7a69')
    expect(optimism).toBe('0x7a6a')
  })

  test('behavior: serves multiple vite pool urls', async () => {
    const poolId = getPoolId()
    const nextPoolUrl = new URL(anvilMainnet.rpcUrl.http)
    nextPoolUrl.pathname = `/${poolId + 1}`

    const [currentPool, nextPool] = await Promise.all([
      request(anvilMainnet, 'eth_chainId'),
      requestUrl(nextPoolUrl.toString(), 'eth_chainId'),
    ])

    expect(currentPool).toBe('0x7a69')
    expect(nextPool).toBe('0x7a69')
    expect(nextPoolUrl.toString()).not.toBe(anvilMainnet.rpcUrl.http)
  })
})
