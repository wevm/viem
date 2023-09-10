import { expect, test } from 'vitest'

import { publicClient } from '~test/src/utils.js'

import { getGasPrice } from './getGasPrice.js'

test('getGasPrice', async () => {
  expect(await getGasPrice(publicClient)).toBeDefined()
})
