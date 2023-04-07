import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../_test/index.js'

import { getBlockNumber } from '../public/getBlockNumber.js'
import { mine } from './mine.js'

test('mines 1 block', async () => {
  const currentBlockNumber = await getBlockNumber(publicClient, { maxAge: 0 })
  await mine(testClient, { blocks: 1 })
  const nextBlockNumber = await getBlockNumber(publicClient, { maxAge: 0 })
  expect(nextBlockNumber).toEqual(currentBlockNumber + 1n)
})

test('mines 5 blocks', async () => {
  const currentBlockNumber = await getBlockNumber(publicClient, { maxAge: 0 })
  await mine(testClient, { blocks: 5 })
  const nextBlockNumber = await getBlockNumber(publicClient, { maxAge: 0 })
  expect(nextBlockNumber).toEqual(currentBlockNumber + 5n)
})
