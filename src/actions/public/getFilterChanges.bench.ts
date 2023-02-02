import { bench, describe } from 'vitest'

import { publicClient } from '../../_test'
import { createPendingTransactionFilter } from './createPendingTransactionFilter'
import { getFilterChanges } from './getFilterChanges'

const filter = await createPendingTransactionFilter(publicClient)

describe('Get Filter Changes', () => {
  bench('viem: `getFilterChanges`', async () => {
    await getFilterChanges(publicClient, { filter })
  })
})
