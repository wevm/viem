import { afterAll } from 'vitest'

import { setConfig } from '../src/core/Errors.js'
import { restart, setup, zone } from './src/tempo.js'

setConfig({ version: 'viem@x.x.x' })

if (!process.env.OFFLINE) {
  await restart()
  await setup()
}

afterAll(async () => {
  if (process.env.OFFLINE) return
  await zone.stop()
})
