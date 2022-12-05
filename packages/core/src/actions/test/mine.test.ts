import { expect, test } from 'vitest'

import { networkClient, testClient } from '../../../../test/src/utils'

import { fetchBlockNumber } from '../block'
import { mine } from './mine'

test('mines 1 block', async () => {
  const currentBlockNumber = await fetchBlockNumber(networkClient)
  await mine(testClient, { blocks: 1 })
  const nextBlockNumber = await fetchBlockNumber(networkClient)
  expect(nextBlockNumber).toEqual(currentBlockNumber + 1)
})

test('mines 5 blocks', async () => {
  const currentBlockNumber = await fetchBlockNumber(networkClient)
  await mine(testClient, { blocks: 5 })
  const nextBlockNumber = await fetchBlockNumber(networkClient)
  expect(nextBlockNumber).toEqual(currentBlockNumber + 5)
})
