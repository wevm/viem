import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../../test'
import { wait } from '../../utils/wait'

import { getBlock } from '../block'
import { setBlockTimestampInterval } from './setBlockTimestampInterval'

test('sets block timestamp interval', async () => {
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
