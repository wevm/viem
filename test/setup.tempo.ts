import { afterAll } from 'vitest'

import { restart, setup, zone } from './src/tempo.js'

if (!process.env.SKIP_GLOBAL_SETUP) {
  await restart()
  await setup()
}

afterAll(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return
  await zone.stop()
})
