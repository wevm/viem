import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet, anvilOptimism, getClient, getPoolId } from './anvil.js'

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
      actions.getChainId(getClient(anvilMainnet)),
      actions.getChainId(getClient(anvilOptimism)),
    ])

    expect(mainnet).toBe(31_337n)
    expect(optimism).toBe(31_338n)
  })
})
