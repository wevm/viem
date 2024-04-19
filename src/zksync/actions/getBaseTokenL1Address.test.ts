import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockBaseTokenL1Address } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getBaseTokenL1Address } from './getBaseTokenL1Address.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getBaseTokenL1Address') return mockBaseTokenL1Address
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const address = await getBaseTokenL1Address(client)
  expect(address).to.equal(mockBaseTokenL1Address)
})
