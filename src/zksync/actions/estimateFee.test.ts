import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockFeeValues,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { estimateFee } from './estimateFee.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const fee = await estimateFee(client, {
    account: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
  })

  expect(fee).to.deep.equal(mockFeeValues)
})
