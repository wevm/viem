import { bench, describe } from 'vitest'

import { publicClient } from '~test/src/utils.js'

import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'

describe.skip('Create Pending Transaction Filter', () => {
  bench('viem: `createPendingTransactionFilter`', async () => {
    await createPendingTransactionFilter(publicClient)
  })
})
