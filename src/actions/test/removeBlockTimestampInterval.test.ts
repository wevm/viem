import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../_test/index.js'
import { wait } from '../../utils/wait.js'

import { getBlock } from '../public/getBlock.js'
import { setBlockTimestampInterval } from './setBlockTimestampInterval.js'
import { removeBlockTimestampInterval } from './removeBlockTimestampInterval.js'

test('removes block timestamp interval', async () => {
  let interval = 86400
  await setBlockTimestampInterval(testClient, { interval })
  const block1 = await getBlock(publicClient, { blockTag: 'latest' })
  await wait(1000)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.timestamp).toEqual(block1.timestamp + BigInt(interval))

  await removeBlockTimestampInterval(testClient)
  interval = 1
  await wait(1000)
  const block3 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block3.timestamp).toEqual(block2.timestamp + BigInt(interval))
})
