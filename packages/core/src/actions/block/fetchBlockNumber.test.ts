import { expect, test } from 'vitest'

import { networkClient } from '../../../../test/src/utils'

import { fetchBlockNumber } from './fetchBlockNumber'

test('fetches block number', async () => {
  expect(await fetchBlockNumber(networkClient)).toBeDefined()
})
