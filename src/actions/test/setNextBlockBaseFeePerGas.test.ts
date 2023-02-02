import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../_test'
import { parseGwei } from '../../utils'
import { wait } from '../../utils/wait'

import { getBlock } from '../public/getBlock'
import { setNextBlockBaseFeePerGas } from './setNextBlockBaseFeePerGas'

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
