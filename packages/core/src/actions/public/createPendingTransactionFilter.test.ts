import { expect, test } from 'vitest'

import { publicClient } from '../../../test'

import { createPendingTransactionFilter } from './createPendingTransactionFilter'

test('default', async () => {
  expect(await createPendingTransactionFilter(publicClient)).toBeDefined()
})
