import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockRange } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getL1BatchBlockRange } from './getL1BatchBlockRange.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getL1BatchBlockRange') return mockRange
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const blockRange = await getL1BatchBlockRange(client, { l1BatchNumber: 0 })
  expect(blockRange).toBeDefined()
  expect(blockRange.length === 2)
  expect(blockRange[0]).to.equal(0)
  expect(blockRange[1]).to.equal(5)
})
