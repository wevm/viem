import { bench, describe } from 'vitest'

import { publicClient } from '../../_test'

import { createPendingTransactionFilter } from './createPendingTransactionFilter'

describe.skip('Create Pending Transaction Filter', () => {
  bench('viem: `createPendingTransactionFilter`', async () => {
    await createPendingTransactionFilter(publicClient)
  })
})
