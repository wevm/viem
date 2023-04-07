import { expect, test } from 'vitest'

import {
  initialBlockNumber,
  publicClient,
  testClient,
} from '../../_test/index.js'

import { getBlockNumber } from '../public/getBlockNumber.js'
import { setIntervalMining } from './setIntervalMining.js'
import { mine } from './mine.js'
import { reset } from './reset.js'

test('resets the fork', async () => {
  await setIntervalMining(testClient, { interval: 0 })
  await mine(testClient, { blocks: 10 })
  await reset(testClient, {
    blockNumber: initialBlockNumber,
  })
  expect(await getBlockNumber(publicClient)).toBe(initialBlockNumber)
  await setIntervalMining(testClient, { interval: 1 })
  await mine(testClient, { blocks: 1 })
})
