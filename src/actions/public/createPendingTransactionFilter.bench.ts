import { bench, describe } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'

const client = anvilMainnet.getClient()

describe.skip('Create Pending Transaction Filter', () => {
  bench('viem: `createPendingTransactionFilter`', async () => {
    await createPendingTransactionFilter(client)
  })
})
