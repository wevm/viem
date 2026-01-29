import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getGasPrice } from './getGasPrice.js'

const client = anvilMainnet.getClient()

test('getGasPrice', async () => {
  expect(await getGasPrice(client)).toBeDefined()
})
