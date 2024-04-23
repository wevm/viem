import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getBlockNumber } from '../public/getBlockNumber.js'

import { mine } from './mine.js'
import { reset } from './reset.js'

const client = anvilMainnet.getClient()

test('resets the fork', async () => {
  await mine(client, { blocks: 10 })
  await expect(
    reset(client, {
      blockNumber: anvilMainnet.forkBlockNumber,
    }),
  ).resolves.toBeUndefined()
  expect(await getBlockNumber(client)).toBe(anvilMainnet.forkBlockNumber)
  await mine(client, { blocks: 1 })
})
