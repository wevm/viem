import { bench, describe } from 'vitest'

import { publicClient, setupAnvil } from '../../_test/index.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { uninstallFilter } from './uninstallFilter.js'

setupAnvil()

const filter = await createPendingTransactionFilter(publicClient)

describe.skip('Uninstall Filter', () => {
  bench('viem: `uninstallFilter`', async () => {
    await uninstallFilter(publicClient, { filter })
  })
})
