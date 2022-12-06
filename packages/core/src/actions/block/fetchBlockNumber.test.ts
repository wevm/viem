import { expect, test } from 'vitest'

import { publicClient } from '../../../test'

import { fetchBlockNumber } from './fetchBlockNumber'

test('fetches block number', async () => {
  expect(await fetchBlockNumber(publicClient)).toBeDefined()
})
