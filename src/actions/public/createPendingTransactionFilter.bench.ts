import { bench, describe } from 'vitest'

import { publicClient, setupAnvil } from '../../_test/index.js'

import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'

setupAnvil()

describe.skip('Create Pending Transaction Filter', () => {
  bench('viem: `createPendingTransactionFilter`', async () => {
    await createPendingTransactionFilter(publicClient)
  })
})
