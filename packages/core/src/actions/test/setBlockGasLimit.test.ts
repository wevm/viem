import { expect, test } from 'vitest'

import { publicClient, testClient } from '../../../test'
import { gweiToValue } from '../../utils'
import { wait } from '../../utils/wait'

import { getBlock } from '../block'
import { setBlockGasLimit } from './setBlockGasLimit'

test('sets block gas limit', async () => {
  const block1 = await getBlock(publicClient, {
    blockTag: 'latest',
  })
  await setBlockGasLimit(testClient, {
    gasLimit: block1.gasLimit + gweiToValue('10'),
  })
  await wait(1000)
  const block2 = await getBlock(publicClient, { blockTag: 'latest' })
  expect(block2.gasLimit).toEqual(block1.gasLimit + gweiToValue('10'))
  await setBlockGasLimit(testClient, { gasLimit: block1.gasLimit })
})
