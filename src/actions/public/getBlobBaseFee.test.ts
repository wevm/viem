import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'

import { getBlobBaseFee } from './getBlobBaseFee.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const baseFee = await getBlobBaseFee(client)
  expect(baseFee).toMatchInlineSnapshot('1n')
})
