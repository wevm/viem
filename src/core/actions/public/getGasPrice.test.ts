import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { getGasPrice } from './getGasPrice.js'

test('default', async () => {
  expect(await getGasPrice(anvil.getClient(anvil.mainnet))).toBeTypeOf('bigint')
})
