import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../_test/index.js'
import { parseGwei } from '../../utils/index.js'
import { wait } from '../../utils/wait.js'

import { getBlock } from '../public/getBlock.js'
import { setBlockGasLimit } from './setBlockGasLimit.js'

test('sets block gas limit', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await setBlockGasLimit(testClient, {
    gasLimit: block1.gasLimit + parseGwei('10'),
  })
  await wait(1000)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.gasLimit).toEqual(block1.gasLimit + parseGwei('10'))
  await setBlockGasLimit(testClient, { gasLimit: block1.gasLimit })
})
