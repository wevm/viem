import { publicClient } from '../../_test/utils.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { uninstallFilter } from './uninstallFilter.js'
import { bench, describe } from 'vitest'

const filter = await createPendingTransactionFilter(publicClient)

describe.skip('Uninstall Filter', () => {
  bench('viem: `uninstallFilter`', async () => {
    await uninstallFilter(publicClient, { filter })
  })
})
