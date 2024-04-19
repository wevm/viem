import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockProofValues,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getLogProof } from './getLogProof.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

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
