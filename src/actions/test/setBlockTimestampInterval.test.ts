import { expect, test } from 'vitest'

import { publicClient, testClient } from '~test/src/utils.js'
import { wait } from '../../utils/wait.js'
import { getBlock } from '../public/getBlock.js'

import { mine } from './mine.js'
import { setBlockTimestampInterval } from './setBlockTimestampInterval.js'

test('sets block timestamp interval', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await expect(
    setBlockTimestampInterval(testClient, { interval: 86400 }),
  ).resolves.toBeUndefined()
  await mine(testClient, { blocks: 1 })
  await wait(200)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.timestamp).toEqual(block1.timestamp + 86400n)
  await mine(testClient, { blocks: 1 })
  await wait(200)
  const block3 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block3.timestamp).toEqual(block2.timestamp + 86400n)
  await setBlockTimestampInterval(testClient, { interval: 1 })
})
