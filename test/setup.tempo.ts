import { afterAll } from 'vitest'

import { restart, setup, zone } from './src/tempo.js'

if (!process.env.OFFLINE) {
  await restart()
  await setup()
}

afterAll(async () => {
  if (process.env.OFFLINE) return
  await zone.stop()
})
