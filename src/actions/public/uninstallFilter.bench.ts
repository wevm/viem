import { bench, describe } from 'vitest'

import { publicClient } from '../../../test'
import { createPendingTransactionFilter } from './createPendingTransactionFilter'
import { uninstallFilter } from './uninstallFilter'

const filter = await createPendingTransactionFilter(publicClient)

describe('Get Filter Changes', () => {
  bench('viem: `uninstallFilter`', async () => {
    await uninstallFilter(publicClient, { filter })
  })
})
