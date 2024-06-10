import { expect, test } from 'vitest'
import {
  getL2GasLimitMockData,
  mockAddress,
  zkSyncClientLocalNodeWithAccountL1,
} from '~test/src/zksync.js'
import { mockClientPublicActionsL2 } from '~test/src/zksyncPublicActionsL2MockData.js'
import { estimateCustomBridgeDepositL2Gas } from './estimateCustomBridgeDepositL2Gas.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

test('estimateCustomBridgeDepositL2Gas', async () => {
  const depositSpecification = await estimateCustomBridgeDepositL2Gas(client, {
    ...getL2GasLimitMockData,
    l1BridgeAddress: mockAddress,
    l2BridgeAddress: mockAddress,
    token: mockAddress,
    amount: 0n,
    to: mockAddress,
    bridgeData: '0x',
    from: mockAddress,
  })
  expect(depositSpecification).toEqual(123456789n)
})
