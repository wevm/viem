import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  mockDetails,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'

import { getL1BatchDetails } from './getL1BatchDetails.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const details = await getL1BatchDetails(client, { number: 0 })
  expect(details).toBeDefined()
  expect(details).to.equal(mockDetails)
})
