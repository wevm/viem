import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  mockedL1BatchNumber,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getL1BatchNumber } from './getL1BatchNumber.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const hex = await getL1BatchNumber(client)
  expect(hex).to.be.equal(mockedL1BatchNumber)
})
