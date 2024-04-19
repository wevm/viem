import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockTestnetPaymasterAddress } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getTestnetPaymasterAddress } from './getTestnetPaymasterAddress.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getTestnetPaymaster') return mockTestnetPaymasterAddress
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const address = await getTestnetPaymasterAddress(client)
  expect(address).to.equal(mockTestnetPaymasterAddress)
})
