import { expect, test } from 'vitest'

import { wait } from '../../utils/wait.js'
import { getBlock } from '../public/getBlock.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { mine } from './mine.js'
import { setBlockTimestampInterval } from './setBlockTimestampInterval.js'

const client = anvilMainnet.getClient()

test('sets block timestamp interval', async () => {
  const block1 = await getBlock(client, {
    blockTag: 'latest',
  })
  await expect(
    setBlockTimestampInterval(client, { interval: 86400 }),
  ).resolves.toBeUndefined()
  await mine(client, { blocks: 1 })
  await wait(200)
  const block2 = await getBlock(client, { blockTag: 'latest' })
  expect(block2.timestamp).toEqual(block1.timestamp + 86400n)
  await mine(client, { blocks: 1 })
  await wait(200)
  const block3 = await getBlock(client, { blockTag: 'latest' })
  expect(block3.timestamp).toEqual(block2.timestamp + 86400n)
  await setBlockTimestampInterval(client, { interval: 1 })
})
