import { expect, test } from 'vitest'

import { networkProvider } from '../../../../test/src/utils'

import { fetchBlockNumber } from './fetchBlockNumber'

test('fetches block number', async () => {
  expect(await fetchBlockNumber(networkProvider)).toBeDefined()
})
