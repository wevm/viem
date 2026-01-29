import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getL1BatchBlockRange } from './getL1BatchBlockRange.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const blockRange = await getL1BatchBlockRange(client, { l1BatchNumber: 0 })
  expect(blockRange).toBeDefined()
  expect(blockRange.length === 2)
  expect(blockRange[0]).to.equal(0)
  expect(blockRange[1]).to.equal(5)
})
