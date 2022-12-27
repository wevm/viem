import { expect, test } from 'vitest'

import { initialBlockNumber, publicClient, testClient } from '../../../test'

import { getBlockNumber } from '../public/getBlockNumber'
import { setIntervalMining } from './setIntervalMining'
import { mine } from './mine'
import { reset } from './reset'

test('resets the fork', async () => {
  await setIntervalMining(testClient, { interval: 0 })
  await mine(testClient, { blocks: 10 })
  await reset(testClient, {
    blockNumber: initialBlockNumber,
  })
  expect(await getBlockNumber(publicClient)).toBe(initialBlockNumber)
  await setIntervalMining(testClient, { interval: 1 })
})
