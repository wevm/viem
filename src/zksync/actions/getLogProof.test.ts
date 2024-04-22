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
  const proof = await getLogProof(client, {
    txHash:
      '0x1f698500b32c325f46f008eda30df9057d54619f0d92b703952c333847a21ded',
  })

  expect(proof).to.deep.equal(mockProofValues)
})

test('args: index', async () => {
  const proof = await getLogProof(client, {
    txHash:
      '0x1f698500b32c325f46f008eda30df9057d54619f0d92b703952c333847a21ded',
    index: 5,
  })

  expect(proof).to.deep.equal(mockProofValues)
})
