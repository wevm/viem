import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../../test'

import { fetchBlockNumber } from '../block'
import { mine } from './mine'

test('mines 1 block', async () => {
  const currentBlockNumber = await fetchBlockNumber(publicClient)
  await mine(testClient, { blocks: 1 })
  const nextBlockNumber = await fetchBlockNumber(publicClient)
  expect(nextBlockNumber).toEqual(currentBlockNumber + 1)
})

test('mines 5 blocks', async () => {
  const currentBlockNumber = await fetchBlockNumber(publicClient)
  await mine(testClient, { blocks: 5 })
  const nextBlockNumber = await fetchBlockNumber(publicClient)
  expect(nextBlockNumber).toEqual(currentBlockNumber + 5)
})
