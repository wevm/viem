import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockRawBlockTransaction,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getRawBlockTransactions } from './getRawBlockTransaction.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const transactions = await getRawBlockTransactions(client, {
    number: 1,
  })

  expect(transactions).to.deep.equal(mockRawBlockTransaction)
})
