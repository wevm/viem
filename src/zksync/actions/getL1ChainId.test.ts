import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockChainId } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../_types/index.js'
import { getL1ChainId } from './getL1ChainId.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_L1ChainId') return mockChainId
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const chainId = await getL1ChainId(client)
  expect(chainId).to.equal(mockChainId)
})
