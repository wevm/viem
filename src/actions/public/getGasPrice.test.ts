import { expect, test } from 'vitest'

import { publicClient } from '../../_test/index.js'
import { getGasPrice } from './getGasPrice.js'

test('getGasPrice', async () => {
  expect(await getGasPrice(publicClient)).toBeDefined()
})
