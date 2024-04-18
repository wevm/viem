import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockTransactionDetails } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../_types/index.js'
import { getTransactionDetails } from './getTransactionDetails.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getTransactionDetails') return mockTransactionDetails
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const details = await getTransactionDetails(client, {
    txHash:
      '0xcf89f4076eae08127daa1b2b9bab94a910d232b4a78b116554f7b29af19e35a4',
  })
  expect(details).to.equal(mockTransactionDetails)
})
