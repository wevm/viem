import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'

import { getBlobBaseFee } from './getBlobBaseFee.js'

const client = anvilMainnet.getClient()

// TODO: Don't skip once implemented on nodes.
test.skip('default', async () => {
  const baseFee = await getBlobBaseFee(client)
  expect(baseFee).toMatchInlineSnapshot()
})
