import { publicClient } from '../../_test/utils.js'
import { getGasPrice } from './getGasPrice.js'
import { expect, test } from 'vitest'

test('getGasPrice', async () => {
  expect(await getGasPrice(publicClient)).toBeDefined()
})
