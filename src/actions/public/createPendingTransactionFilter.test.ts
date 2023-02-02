import { expect, test } from 'vitest'

import { publicClient } from '../../_test'

import { createPendingTransactionFilter } from './createPendingTransactionFilter'

test('default', async () => {
  expect(await createPendingTransactionFilter(publicClient)).toBeDefined()
})
