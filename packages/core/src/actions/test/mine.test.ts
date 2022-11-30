import { expect, test } from 'vitest'

import { networkRpc, testRpc } from '../../../../test/src/utils'

import { fetchBlockNumber } from '../block'
import { mine } from './mine'

test('mines 1 block', async () => {
  const currentBlockNumber = await fetchBlockNumber(networkRpc)
  await mine(testRpc, { blocks: 1 })
  const nextBlockNumber = await fetchBlockNumber(networkRpc)
  expect(nextBlockNumber).toEqual(currentBlockNumber + 1)
})

test('mines 5 blocks', async () => {
  const currentBlockNumber = await fetchBlockNumber(networkRpc)
  await mine(testRpc, { blocks: 5 })
  const nextBlockNumber = await fetchBlockNumber(networkRpc)
  expect(nextBlockNumber).toEqual(currentBlockNumber + 5)
})
