import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../_test/index.js'
import { wait } from '../../utils/wait.js'

import { getBlock } from '../public/getBlock.js'
import { setBlockTimestampInterval } from './setBlockTimestampInterval.js'
import { setIntervalMining } from './setIntervalMining.js'

test('sets block timestamp interval', async () => {
  await setIntervalMining(testClient, { interval: 1 })
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await setBlockTimestampInterval(testClient, { interval: 86400 })
  await wait(1000)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.timestamp).toEqual(block1.timestamp + 86400n)
  await wait(1000)
  const block3 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block3.timestamp).toEqual(block2.timestamp + 86400n)
  await setBlockTimestampInterval(testClient, { interval: 1 })
})
