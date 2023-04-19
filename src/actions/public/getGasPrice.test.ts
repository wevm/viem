import { expect, test } from 'vitest'

import { publicClient, setupAnvil } from '../../_test/index.js'
import { getGasPrice } from './getGasPrice.js'

setupAnvil()

test('getGasPrice', async () => {
  expect(await getGasPrice(publicClient)).toBeDefined()
})
