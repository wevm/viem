import { expect, test } from 'vitest'

import { parseGwei } from '../../utils/unit/parseGwei.js'

import { getBlock } from '../public/getBlock.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { mine } from './mine.js'
import { setBlockGasLimit } from './setBlockGasLimit.js'

const client = anvilMainnet.getClient()

test('sets block gas limit', async () => {
  const block1 = await getBlock(client, {
    blockTag: 'latest',
  })
  await expect(
    setBlockGasLimit(client, {
      gasLimit: block1.gasLimit + parseGwei('10'),
    }),
  ).resolves.toBeUndefined()

  await mine(client, { blocks: 1 })

  const block2 = await getBlock(client, { blockTag: 'latest' })
  expect(block2.gasLimit).toEqual(block1.gasLimit + parseGwei('10'))
  await setBlockGasLimit(client, { gasLimit: block1.gasLimit })
})
