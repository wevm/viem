import { bench, describe } from 'vitest'

import { publicClient } from '../../_test'
import { createPendingTransactionFilter } from './createPendingTransactionFilter'
import { uninstallFilter } from './uninstallFilter'

const filter = await createPendingTransactionFilter(publicClient)

describe.skip('Uninstall Filter', () => {
  bench('viem: `uninstallFilter`', async () => {
    await uninstallFilter(publicClient, { filter })
  })
})
