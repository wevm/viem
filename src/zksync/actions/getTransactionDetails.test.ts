import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockTransactionDetails,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getTransactionDetails } from './getTransactionDetails.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const details = await getTransactionDetails(client, {
    txHash:
      '0xcf89f4076eae08127daa1b2b9bab94a910d232b4a78b116554f7b29af19e35a4',
  })
  expect(details).to.equal(mockTransactionDetails)
})
