import { bench, describe } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'

const client = anvilMainnet.getClient()

const filter = await createPendingTransactionFilter(client)

describe.skip('Get Filter Changes', () => {
  bench('viem: `getFilterChanges`', async () => {
    await getFilterChanges(client, { filter })
  })
})
