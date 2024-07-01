import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  mockHash,
  zkSyncClientLocalNode,
} from '../../../../test/src/zksync.js'
import { getTransactionStatusL2 } from './getTransactionStatusL2.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const txStatus = await getTransactionStatusL2(client, { txHash: mockHash })
  expect(txStatus).toBeDefined()
})
