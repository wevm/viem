import { expect, test } from 'vitest'

import { parseGwei } from '../../utils/unit/parseGwei.js'

import { getBlock } from '../public/getBlock.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { mine } from './mine.js'
import { setNextBlockBaseFeePerGas } from './setNextBlockBaseFeePerGas.js'

const client = anvilMainnet.getClient()

test('set next block base fee per gas', async () => {
  const block1 = await getBlock(client, {
    blockTag: 'latest',
  })
  await expect(
    setNextBlockBaseFeePerGas(client, {
      baseFeePerGas: block1.baseFeePerGas! + parseGwei('10'),
    }),
  ).resolves.toBeUndefined()

  await mine(client, { blocks: 1 })

  const block2 = await getBlock(client, { blockTag: 'latest' })
  expect(block2.baseFeePerGas).toEqual(block1.baseFeePerGas! + parseGwei('10'))
  await setNextBlockBaseFeePerGas(client, {
    baseFeePerGas: block1.baseFeePerGas!,
  })
})
