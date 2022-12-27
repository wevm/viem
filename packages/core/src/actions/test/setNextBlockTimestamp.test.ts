import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../../test'
import { wait } from '../../utils/wait'

import { getBlock } from '../public/getBlock'
import { setNextBlockTimestamp } from './setNextBlockTimestamp'

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
