import { expect, test } from 'vitest'
import {
  getL2GasLimitMockData,
  mockAddress,
  zkSyncClientLocalNodeWithAccountL1,
} from '~test/src/zksync.js'
import { mockClientPublicActionsL2 } from '~test/src/zksyncPublicActionsL2MockData.js'
import { estimateDefaultBridgeDepositL2Gas } from './estimateDefaultBridgeDepositL2Gas.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

test('estimateDefaultBridgeDepositL2Gas', async () => {
  const depositSpecification = await estimateDefaultBridgeDepositL2Gas(client, {
    ...getL2GasLimitMockData,
    token: mockAddress,
    amount: 0n,
    to: mockAddress,
    gasPerPubdataByte: 800n,
  })
  expect(depositSpecification).toEqual(123456789n)
})
