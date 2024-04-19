import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockProofValues } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getLogProof } from './getLogProof.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getL2ToL1LogProof') return mockProofValues
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const fee = await getLogProof(client, {
    txHash: '0x',
  })

  expect(fee).to.deep.equal(mockProofValues)
})

test('args: index', async () => {
  const fee = await getLogProof(client, {
    txHash: '0x',
    index: 5,
  })

  expect(fee).to.deep.equal(mockProofValues)
})
