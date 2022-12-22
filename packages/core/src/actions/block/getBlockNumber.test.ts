import { expect, test } from 'vitest'

import { publicClient } from '../../../test'

import { getBlockNumber } from './getBlockNumber'

test('gets block number', async () => {
  expect(await getBlockNumber(publicClient)).toBeDefined()
})
