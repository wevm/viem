import { afterAll, beforeAll } from 'vitest'

import { rpcUrl, setup, zone } from './src/tempo.js'

beforeAll(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return
  await setup()
})

// Reap the file's node instance; containers otherwise accumulate across files.
afterAll(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return
  await zone.stop()
  await fetch(`${rpcUrl}/stop`)
})
