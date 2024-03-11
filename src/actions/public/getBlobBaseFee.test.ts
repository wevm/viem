import { expect, test } from 'vitest'
import { publicClient } from '../../../test/src/utils.js'
import { getBlobBaseFee } from './getBlobBaseFee.js'

// TODO: Don't skip once implemented on nodes.
test.skip('default', async () => {
  const baseFee = await getBlobBaseFee(publicClient)
  expect(baseFee).toMatchInlineSnapshot()
})
