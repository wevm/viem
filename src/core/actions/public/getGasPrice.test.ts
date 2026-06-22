import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { getGasPrice } from './getGasPrice.js'

describe('getGasPrice', () => {
  test('default', async () => {
    expect(await getGasPrice(anvil.getClient(anvil.mainnet))).toBeTypeOf(
      'bigint',
    )
  })
})
