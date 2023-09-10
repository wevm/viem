import { expect, test } from 'vitest'

import { forkBlockNumber } from '~test/src/constants.js'
import { publicClient, testClient } from '~test/src/utils.js'
import { getBlockNumber } from '../public/getBlockNumber.js'

import { mine } from './mine.js'
import { reset } from './reset.js'

test('resets the fork', async () => {
  await mine(testClient, { blocks: 10 })
  await expect(
    reset(testClient, {
      blockNumber: forkBlockNumber,
    }),
  ).resolves.toBeUndefined()
  expect(await getBlockNumber(publicClient)).toBe(forkBlockNumber)
  await mine(testClient, { blocks: 1 })
})
