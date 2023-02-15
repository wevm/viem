import { defineConfig } from 'tsup'

import { getConfig } from './scripts/tsup'
import { tsup, dependencies } from './package.json'

export default defineConfig(
  getConfig({
    dev: process.env.DEV === 'true',
    entry: tsup.entry,
    external: Object.keys(dependencies),
    platform: 'neutral',
  }),
)
