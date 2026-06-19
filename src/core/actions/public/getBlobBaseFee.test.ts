import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { getBlobBaseFee } from './getBlobBaseFee.js'

describe('getBlobBaseFee', () => {
  test('default', async () => {
    expect(await getBlobBaseFee(getClient(anvilMainnet))).toBeTypeOf('bigint')
  })
})
