import { defineConfig } from 'tsup'

import { getConfig } from '../../scripts/tsup'
import { exports, peerDependencies } from './package.json'

export default defineConfig(
  getConfig({
    dev: process.env.DEV === 'true',
    entry: ['src/index.ts', 'src/setup.ts'],
    exports,
    external: Object.keys(peerDependencies),
    platform: 'node',
  }),
)
