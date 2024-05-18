import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockedL1BatchNumber,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getL1BatchNumber } from './getL1BatchNumber.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const hex = await getL1BatchNumber(client)
  expect(hex).to.be.equal(mockedL1BatchNumber)
})
