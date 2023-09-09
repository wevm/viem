import { bench, describe } from 'vitest'

import { publicClient } from '~test/src/utils.js'

import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'

const filter = await createPendingTransactionFilter(publicClient)

describe.skip('Get Filter Changes', () => {
  bench('viem: `getFilterChanges`', async () => {
    await getFilterChanges(publicClient, { filter })
  })
})
