import { expect, test } from 'vitest'

import { publicClient } from '../../_test/index.js'

import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'

test('default', async () => {
  expect(await createPendingTransactionFilter(publicClient)).toBeDefined()
})
