import { expect, test } from 'vitest'
import {
  getL2GasLimitMockData,
  mockAddress,
  zkSyncClientLocalNodeWithAccountL1,
} from '~test/src/zksync.js'
import { mockClientPublicActionsL2 } from '~test/src/zksyncPublicActionsL2MockData.js'
import { estimateL1ToL2Execute } from './estimateL1ToL2Execute.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

test('estimateL1ToL2Execute.test', async () => {
  const depositSpecification = await estimateL1ToL2Execute(client, {
    ...getL2GasLimitMockData,
    gasPerPubdataByte: 800n,
    contractAddress: mockAddress,
    calldata: '0x',
  })
  expect(depositSpecification).toEqual(123456789n)
})
