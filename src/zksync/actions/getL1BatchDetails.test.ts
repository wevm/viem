import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockDetails,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getL1BatchDetails } from './getL1BatchDetails.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const details = await getL1BatchDetails(client, { number: 0 })
  console.info(details)
  expect(details).toBeDefined()
  expect(details).to.equal(mockDetails)
})
