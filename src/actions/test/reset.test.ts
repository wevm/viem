import { expect, test } from 'vitest'

import {
  initialBlockNumber,
  publicClient,
  testClient,
} from '../../_test/index.js'
import { getBlockNumber } from '../public/getBlockNumber.js'
import { mine } from './mine.js'
import { reset } from './reset.js'
import { setIntervalMining } from './setIntervalMining.js'

test('resets the fork', async () => {
  await setIntervalMining(testClient, { interval: 0 })
  await mine(testClient, { blocks: 10 })
  await expect(
    reset(testClient, {
      blockNumber: initialBlockNumber,
    }),
  ).resolves.toBeUndefined()
  expect(await getBlockNumber(publicClient)).toBe(initialBlockNumber)
  await setIntervalMining(testClient, { interval: 1 })
  await mine(testClient, { blocks: 1 })
})
