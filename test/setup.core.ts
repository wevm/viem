import { inject } from 'vitest'

import { poolId } from './src/constants.js'
import { resetPool } from './src/pool.js'

if (!process.env.SKIP_GLOBAL_SETUP) {
  const instances = inject('coreInstances')
  await resetPool([instances.bundlers, instances.anvils], poolId)
}
