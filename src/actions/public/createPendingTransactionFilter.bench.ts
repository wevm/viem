import { bench, describe } from 'vitest'

import { publicClient } from '../../_test'

import { createPendingTransactionFilter } from './createPendingTransactionFilter'

describe('Create Pending Transaction Filter', () => {
  bench('viem: `createPendingTransactionFilter`', async () => {
    await createPendingTransactionFilter(publicClient)
  })
})
