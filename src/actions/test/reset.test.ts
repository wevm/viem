import { expect, test } from 'vitest'

import { publicClient, testClient } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { getBlockNumber } from '../public/getBlockNumber.js'

import { mine } from './mine.js'
import { reset } from './reset.js'

test('resets the fork', async () => {
  await mine(testClient, { blocks: 10 })
  await expect(
    reset(testClient, {
      blockNumber: anvilMainnet.forkBlockNumber,
    }),
  ).resolves.toBeUndefined()
  expect(await getBlockNumber(publicClient)).toBe(anvilMainnet.forkBlockNumber)
  await mine(testClient, { blocks: 1 })
})
