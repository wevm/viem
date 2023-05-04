import { publicClient } from '../../_test/utils.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { bench, describe } from 'vitest'

describe.skip('Create Pending Transaction Filter', () => {
  bench('viem: `createPendingTransactionFilter`', async () => {
    await createPendingTransactionFilter(publicClient)
  })
})
