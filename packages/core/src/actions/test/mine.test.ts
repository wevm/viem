import { expect, test } from 'vitest'

import { networkProvider, testProvider } from '../../../../test/src/utils'

import { fetchBlockNumber } from '../block'
import { mine } from './mine'

test('mines 1 block', async () => {
  const currentBlockNumber = await fetchBlockNumber(networkProvider)
  await mine(testProvider, { blocks: 1 })
  const nextBlockNumber = await fetchBlockNumber(networkProvider)
  expect(nextBlockNumber).toEqual(currentBlockNumber + 1)
})

test('mines 5 blocks', async () => {
  const currentBlockNumber = await fetchBlockNumber(networkProvider)
  await mine(testProvider, { blocks: 5 })
  const nextBlockNumber = await fetchBlockNumber(networkProvider)
  expect(nextBlockNumber).toEqual(currentBlockNumber + 5)
})
