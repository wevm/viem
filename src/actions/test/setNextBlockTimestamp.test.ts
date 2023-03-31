import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../_test/index.js'
import { wait } from '../../utils/wait.js'

import { getBlock } from '../public/getBlock.js'
import { setNextBlockTimestamp } from './setNextBlockTimestamp.js'

test('sets block timestamp interval', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await setNextBlockTimestamp(testClient, {
    timestamp: block1.timestamp + 86400n,
  })
  await wait(1000)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.timestamp).toEqual(block1.timestamp + 86400n)
})
