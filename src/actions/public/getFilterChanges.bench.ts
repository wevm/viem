import { publicClient } from '../../_test/utils.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'
import { bench, describe } from 'vitest'

const filter = await createPendingTransactionFilter(publicClient)

describe.skip('Get Filter Changes', () => {
  bench('viem: `getFilterChanges`', async () => {
    await getFilterChanges(publicClient, { filter })
  })
})
