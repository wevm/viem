import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../../test'
import { wait } from '../../utils/wait'

import { getBlock } from '../block'
import { increaseTime } from './increaseTime'

test('increases time', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await increaseTime(testClient, { seconds: 86400 })
  await wait(1000)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.timestamp).toBeGreaterThan(block1.timestamp + 86400n)
})
