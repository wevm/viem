import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../../test'
import { wait } from '../../utils/wait'
import { getBlockNumber } from '../block'
import { mine } from './mine'

import { setIntervalMining } from './setIntervalMining'

test('sets mining interval', async () => {
  await mine(testClient, { blocks: 1 })

  const blockNumber1 = await getBlockNumber(publicClient, { maxAge: 0 })
  await setIntervalMining(testClient, { interval: 1 })
  await wait(2000)
  const blockNumber2 = await getBlockNumber(publicClient, { maxAge: 0 })
  expect(blockNumber2 - blockNumber1).toBe(2n)

  await setIntervalMining(testClient, { interval: 2 })
  await wait(2000)
  const blockNumber3 = await getBlockNumber(publicClient, { maxAge: 0 })
  expect(blockNumber3 - blockNumber2).toBe(1n)

  await setIntervalMining(testClient, { interval: 0 })
  await wait(2000)
  const blockNumber4 = await getBlockNumber(publicClient, { maxAge: 0 })
  expect(blockNumber4 - blockNumber3).toBe(0n)

  await setIntervalMining(testClient, { interval: 1 })
})
