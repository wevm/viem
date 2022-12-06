import { expect, test } from 'vitest'

import { publicClient } from '../../../../test/src/utils'

import { fetchBlockNumber } from './fetchBlockNumber'

test('fetches block number', async () => {
  expect(await fetchBlockNumber(publicClient)).toBeDefined()
})
