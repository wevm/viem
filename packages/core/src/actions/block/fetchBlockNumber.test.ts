import { expect, test } from 'vitest'

import { networkRpc } from '../../../../test/src/utils'

import { fetchBlockNumber } from './fetchBlockNumber'

test('fetches block number', async () => {
  expect(await fetchBlockNumber(networkRpc)).toBeDefined()
})
