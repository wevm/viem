import { expect, test } from 'vitest'

import { publicClient, testClient } from '~test/src/utils.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'

import { getBlock } from '../public/getBlock.js'

import { mine } from './mine.js'
import { setNextBlockBaseFeePerGas } from './setNextBlockBaseFeePerGas.js'

test('set next block base fee per gas', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await expect(
    setNextBlockBaseFeePerGas(testClient, {
      baseFeePerGas: block1.baseFeePerGas! + parseGwei('10'),
    }),
  ).resolves.toBeUndefined()

  await mine(testClient, { blocks: 1 })

  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.baseFeePerGas).toEqual(block1.baseFeePerGas! + parseGwei('10'))
  await setNextBlockBaseFeePerGas(testClient, {
    baseFeePerGas: block1.baseFeePerGas!,
  })
})
