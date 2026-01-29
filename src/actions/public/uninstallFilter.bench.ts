import { bench, describe } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { uninstallFilter } from './uninstallFilter.js'

const client = anvilMainnet.getClient()

const filter = await createPendingTransactionFilter(client)

describe.skip('Uninstall Filter', () => {
  bench('viem: `uninstallFilter`', async () => {
    await uninstallFilter(client, { filter })
  })
})
