import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { getBlobBaseFee } from './getBlobBaseFee.js'

describe('getBlobBaseFee', () => {
  test('default', async () => {
    expect(await getBlobBaseFee(anvil.getClient(anvil.mainnet))).toBeTypeOf(
      'bigint',
    )
  })
})
