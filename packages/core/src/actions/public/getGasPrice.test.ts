import { expect, test } from 'vitest'

import { publicClient } from '../../../test'
import { getGasPrice } from './getGasPrice'

test('getGasPrice', async () => {
  expect(await getGasPrice(publicClient)).toBeDefined()
})
