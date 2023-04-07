import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../_test/index.js'
import { parseGwei } from '../../utils/index.js'
import { wait } from '../../utils/wait.js'

import { getBlock } from '../public/getBlock.js'
import { setNextBlockBaseFeePerGas } from './setNextBlockBaseFeePerGas.js'

test('set next block base fee per gas', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await setNextBlockBaseFeePerGas(testClient, {
    baseFeePerGas: block1.baseFeePerGas! + parseGwei('10'),
  })
  await wait(1000)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.baseFeePerGas).toEqual(block1.baseFeePerGas! + parseGwei('10'))
  await setNextBlockBaseFeePerGas(testClient, {
    baseFeePerGas: block1.baseFeePerGas!,
  })
})
