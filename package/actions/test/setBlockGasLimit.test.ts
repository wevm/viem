import { expect, test } from 'vitest'

import { publicClient, testClient } from '~test/src/utils.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'

import { getBlock } from '../public/getBlock.js'

import { mine } from './mine.js'
import { setBlockGasLimit } from './setBlockGasLimit.js'

test('sets block gas limit', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await expect(
    setBlockGasLimit(testClient, {
      gasLimit: block1.gasLimit + parseGwei('10'),
    }),
  ).resolves.toBeUndefined()

  await mine(testClient, { blocks: 1 })

  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.gasLimit).toEqual(block1.gasLimit + parseGwei('10'))
  await setBlockGasLimit(testClient, { gasLimit: block1.gasLimit })
})
