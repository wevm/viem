import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockTestnetPaymasterAddress,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getTestnetPaymasterAddress } from './getTestnetPaymasterAddress.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const address = await getTestnetPaymasterAddress(client)
  expect(address).to.equal(mockTestnetPaymasterAddress)
})
