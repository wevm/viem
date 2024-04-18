import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockFeeValues } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../_types/index.js'
import { estimateFee } from './estimateFee.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_estimateFee') return mockFeeValues
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const fee = await estimateFee(client, {
    transactionRequest: {
      from: '0x',
    },
  })

  expect(fee).to.deep.equal(mockFeeValues)
})
