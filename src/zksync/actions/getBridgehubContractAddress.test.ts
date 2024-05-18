import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockAddress,
  mockClientPublicActionsL2,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getBridgehubContractAddress } from './getBridgehubContractAddress.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const bridgeHubContractAddress = await getBridgehubContractAddress(client)
  expect(bridgeHubContractAddress).to.equal(mockAddress)
})
