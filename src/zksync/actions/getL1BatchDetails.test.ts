import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockDetails } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getL1BatchDetails } from './getL1BatchDetails.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getL1BatchDetails') return mockDetails
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const details = await getL1BatchDetails(client, { number: 0 })
  expect(details).toBeDefined()
  expect(details).to.equal(mockDetails)
})
