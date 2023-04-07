import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../_test/index.js'

import { getBlock } from '../public/getBlock.js'
import { increaseTime } from './increaseTime.js'
import { mine } from './mine.js'

// TODO: Anvil seems to not register the increased timestamp sometimes.
test.skip('increases time', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await increaseTime(testClient, { seconds: 86400 })
  await mine(testClient, { blocks: 1 })
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.timestamp).toBeGreaterThan(block1.timestamp + (86400n - 1000n))
})
