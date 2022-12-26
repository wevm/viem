import { defineConfig } from 'tsup'

import { getConfig } from '../../scripts/tsup'
import { dependencies } from './package.json'

export default defineConfig(
  getConfig({
    dev: process.env.DEV === 'true',
    entry: [
      'src/index.ts',
      'src/actions/index.ts',
      'src/chains.ts',
      'src/clients/index.ts',
      'src/utils/index.ts',
      'src/window.ts',
    ],
    external: Object.keys(dependencies),
    platform: 'neutral',
  }),
)
