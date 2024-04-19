import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockMainContractAddress,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getMainContractAddress } from './getMainContractAddress.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const address = await getMainContractAddress(client)
  expect(address).to.equal(mockMainContractAddress)
})
