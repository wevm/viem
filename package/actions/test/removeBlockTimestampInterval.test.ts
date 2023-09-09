import { expect, test } from 'vitest'

import { publicClient, testClient } from '~test/src/utils.js'
import { wait } from '../../utils/wait.js'
import { getBlock } from '../public/getBlock.js'

import { mine } from './mine.js'
import { removeBlockTimestampInterval } from './removeBlockTimestampInterval.js'
import { setBlockTimestampInterval } from './setBlockTimestampInterval.js'

test('removes block timestamp interval', async () => {
  let interval = 86400
  await expect(
    setBlockTimestampInterval(testClient, { interval }),
  ).resolves.toBeUndefined()
  const block1 = await getBlock(publicClient, { blockTag: 'latest' })
  await mine(testClient, { blocks: 1 })
  await wait(200)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.timestamp).toEqual(block1.timestamp + BigInt(interval))

  await removeBlockTimestampInterval(testClient)
  interval = 1
  await mine(testClient, { blocks: 1 })
  await wait(200)
  const block3 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block3.timestamp).toEqual(block2.timestamp + BigInt(interval))
})
