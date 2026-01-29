import { expect, test } from 'vitest'

import { wait } from '../../utils/wait.js'
import { getBlock } from '../public/getBlock.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { mine } from './mine.js'
import { removeBlockTimestampInterval } from './removeBlockTimestampInterval.js'
import { setBlockTimestampInterval } from './setBlockTimestampInterval.js'

const client = anvilMainnet.getClient()

test('removes block timestamp interval', async () => {
  let interval = 86400
  await expect(
    setBlockTimestampInterval(client, { interval }),
  ).resolves.toBeUndefined()
  const block1 = await getBlock(client, { blockTag: 'latest' })
  await mine(client, { blocks: 1 })
  await wait(200)
  const block2 = await getBlock(client, { blockTag: 'latest' })
  expect(block2.timestamp).toEqual(block1.timestamp + BigInt(interval))

  await removeBlockTimestampInterval(client)
  interval = 1
  await mine(client, { blocks: 1 })
  await wait(200)
  const block3 = await getBlock(client, { blockTag: 'latest' })
  expect(block3.timestamp).toEqual(block2.timestamp + BigInt(interval))
})
