import { defineConfig } from 'tsup'

import { getConfig } from '../../scripts/tsup'
import { dependencies, exports } from './package.json'

export default defineConfig(
  getConfig({
    dev: process.env.DEV === 'true',
    entry: [
      'src/index.ts',
      'src/actions/index.ts',
      'src/chains.ts',
      'src/providers/account/index.ts',
      'src/providers/network/index.ts',
      'src/providers/test/index.ts',
      'src/providers/wallet/index.ts',
      'src/utils/index.ts',
      'src/window.ts',
    ],
    exports,
    external: Object.keys(dependencies),
    platform: 'neutral',
  }),
)
