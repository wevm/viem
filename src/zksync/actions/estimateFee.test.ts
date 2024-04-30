import { expect, test } from 'vitest'
import {
  zkSyncClientLocalNode,
  zkSyncClientLocalNodeWithAccount,
} from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockFeeValues,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { estimateFee } from './estimateFee.js'

const client = { ...zkSyncClientLocalNode }

const clientWithAccount = { ...zkSyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)

test('default', async () => {
  const fee = await estimateFee(client, {
    account: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    to: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    value: 0n,
  })

  expect(fee).to.deep.equal(mockFeeValues)
})

mockClientPublicActionsL2(clientWithAccount)

test('default with account', async () => {
  const fee = await estimateFee(clientWithAccount, {
    to: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    value: 0n,
  })

  expect(fee).to.deep.equal(mockFeeValues)
})
