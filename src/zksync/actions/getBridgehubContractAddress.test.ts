import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockAddress } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getBridgehubContractAddress } from './getBridgehubContractAddress.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getBridgehubContract') return mockAddress
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const bridgeHubContractAddress = await getBridgehubContractAddress(client)
  expect(bridgeHubContractAddress).to.equal(mockAddress)
})
