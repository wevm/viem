import { expect, test } from 'vitest'

import { publicClient, testClient } from '~test/src/utils.js'

import { getBlock } from '../public/getBlock.js'

import { mine } from './mine.js'
import { setNextBlockTimestamp } from './setNextBlockTimestamp.js'

test('sets block timestamp interval', async () => {
  await mine(testClient, { blocks: 1 })

  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await expect(
    setNextBlockTimestamp(testClient, {
      timestamp: block1.timestamp + 86400n,
    }),
  ).resolves.toBeUndefined()

  await mine(testClient, { blocks: 1 })

  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.timestamp).toEqual(block1.timestamp + 86400n)
})
