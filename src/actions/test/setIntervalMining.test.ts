import { expect, test } from 'vitest'

import { wait } from '../../utils/wait.js'
import { getBlockNumber } from '../public/getBlockNumber.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { mine } from './mine.js'
import { setIntervalMining } from './setIntervalMining.js'

const client = anvilMainnet.getClient()

test('sets mining interval', async () => {
  await mine(client, { blocks: 1 })

  const blockNumber1 = await getBlockNumber(client, { cacheTime: 0 })
  await expect(
    setIntervalMining(client, { interval: 1 }),
  ).resolves.toBeUndefined()
  await wait(2000)
  const blockNumber2 = await getBlockNumber(client, { cacheTime: 0 })
  expect(blockNumber2 - blockNumber1).toBe(2n)

  await setIntervalMining(client, { interval: 2 })
  await wait(2000)
  const blockNumber3 = await getBlockNumber(client, { cacheTime: 0 })
  expect(blockNumber3 - blockNumber2).toBe(1n)

  await setIntervalMining(client, { interval: 0 })
  await wait(2000)
  const blockNumber4 = await getBlockNumber(client, { cacheTime: 0 })
  expect(blockNumber4 - blockNumber3).toBe(0n)
})
