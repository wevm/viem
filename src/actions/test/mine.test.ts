import { publicClient } from '../../_test/utils.js'
import { testClient } from '../../_test/utils.js'
import { getBlockNumber } from '../public/getBlockNumber.js'
import { mine } from './mine.js'
import { expect, test } from 'vitest'

test('mines 1 block', async () => {
  const currentBlockNumber = await getBlockNumber(publicClient, { maxAge: 0 })
  await expect(mine(testClient, { blocks: 1 })).resolves.toBeUndefined()
  const nextBlockNumber = await getBlockNumber(publicClient, { maxAge: 0 })
  expect(nextBlockNumber).toEqual(currentBlockNumber + 1n)
})

test('mines 5 blocks', async () => {
  const currentBlockNumber = await getBlockNumber(publicClient, { maxAge: 0 })
  await mine(testClient, { blocks: 5 })
  const nextBlockNumber = await getBlockNumber(publicClient, { maxAge: 0 })
  expect(nextBlockNumber).toEqual(currentBlockNumber + 5n)
})
