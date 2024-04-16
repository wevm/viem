import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getL1BatchBlockRange } from './getL1BatchBlockRange.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const blockRange = await getL1BatchBlockRange(client, { l1BatchNumber: 0 })
  expect(blockRange).toBeDefined()
  expect(blockRange.length === 2)
})
