import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { getGasPrice } from './getGasPrice.js'

describe('getGasPrice', () => {
  test('default', async () => {
    expect(await getGasPrice(getClient(anvilMainnet))).toBeTypeOf('bigint')
  })
})
