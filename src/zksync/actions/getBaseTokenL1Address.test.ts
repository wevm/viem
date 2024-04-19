import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockBaseTokenL1Address,
  mockClientPublicActionsL2,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getBaseTokenL1Address } from './getBaseTokenL1Address.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const address = await getBaseTokenL1Address(client)
  expect(address).to.equal(mockBaseTokenL1Address)
})
